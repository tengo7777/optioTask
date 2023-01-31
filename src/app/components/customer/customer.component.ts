import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatTableDataSource } from '@angular/material/table';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpService } from 'src/app/shared/services/http.service';
import { Customer } from 'src/app/shared/models/customer.model';
import { debounceTime, distinctUntilChanged, filter, fromEvent, tap } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { DeleteModalComponent } from 'src/app/shared/modal/delete-modal/delete-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  showFiller = false;
  addOnBlur = true;
  saveBtn: boolean = true;
  totalUsers!: number;
  searchInfo: any = new Object();
  drawerOpened: boolean = false;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  userRoles: any[] = [];
  displayedColumns: string[] = ['email', 'firstName', 'lastName', 'roles', 'locked', 'removeUser'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('search') search!: ElementRef;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  status: any[] = [
    { value: true, title: 'Active' },
    { value: false, title: 'In Active' },
  ];

  customer: Customer = new Customer();
  constructor(private http: HttpService, public dialog: MatDialog, private activatedRt: ActivatedRoute, private location: Location, private router: Router) { }

  ngOnInit(): void {
    this.readAllRoles();
    this.getRouteParams();
  }

  ngAfterViewInit() {
    fromEvent(this.search.nativeElement, 'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => {
          this.readAllUsers(true);
        })
      )
      .subscribe();
  }

  readAllUsers(search: boolean = false, updateRoutingUrl: boolean = true) {
    if (search) {
      this.paginator.pageIndex = 0;
    }
    if (updateRoutingUrl) {
      this.updateRoutingParameters();
    }
    const postUSerDAta = {
      "pageIndex": this.paginator.pageIndex ? this.paginator.pageIndex : 0,
      "pageSize": this.paginator.pageSize ? this.paginator.pageSize : 5,
      ...this.searchInfo
    }
    this.http.getAllUsers(postUSerDAta).subscribe((res: any) => {
      if (res.success) {
        this.dataSource.data = res.data.entities;
        this.totalUsers = res.data.total;
      }
    })
  }

  updateRoutingParameters() {
    const params = {
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      search: this.searchInfo['search'],
      active: this.searchInfo['sortBy'],
      direction: this.searchInfo['sortDirection'],
    };
    console.log(params)
    const urlTree = this.router.createUrlTree([''], {
      relativeTo: this.activatedRt,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
    this.location.go(urlTree.toString());
  }

  getRouteParams() {
    this.activatedRt.queryParams.subscribe((params: any) => {
      this.paginator.pageIndex = params['pageIndex'];
      this.paginator.pageSize = params['pageSize'];
      this.searchInfo['search'] = params['search'];
      this.searchInfo['sortBy'] = params['active'];
      this.searchInfo['sortDirection'] = params['direction'];
      this.readAllUsers(false, false);
    })
  }

  readAllRoles() {
    const postRolesData = {
      "typeId": 4,
      "sortBy": "name",
      "sortDirection": "asc",
      "pageIndex": 0,
      "pageSize": 50,
      "includes": [
        "code", "name"
      ]
    }
    this.http.getAllRoles(postRolesData).subscribe(res => {
      if (res.success) {
        this.userRoles = res.data.entities;
      }
    })
  }

  checkInputsValidation() {
    if (this.customer.email != '' && this.customer.firstName != '' && this.customer.lastName != ''
      && this.customer.locked != undefined && this.customer.roles.length > 0) {
      this.saveBtn = false;
    } else {
      this.saveBtn = true;
    }
  }


  getStatusText(element: any) {
    let status: boolean = element.locked
    return this.status.filter((item: any) => item.value == status)[0].title;
  }

  updateUserInfo(item: Customer) {
    this.drawerOpened = true;
    this.customer = item;
    this.checkInputsValidation();
  }


  sortBy() {
    this.searchInfo['sortBy'] = this.sort.active;
    this.searchInfo['sortDirection'] = this.sort.direction;
    this.readAllUsers();
    console.log(this.sort)
  }

  createUpdateUser() {
    if (!this.saveBtn) {
      this.http.addOrUpdateUser(this.customer).subscribe((response: any) => {
        if (response.success) {
          this.customer = new Customer();
          this.readAllUsers();
          this.checkInputsValidation();
        }
      })
    }
  }

  DeleteUSer(id: any) {
    const dialogRef = this.dialog.open(DeleteModalComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customer.id = id;
        this.http.deleteUSer(this.customer).subscribe(res => {
          if (res.success) {
            this.readAllUsers();
          }
        })
      }
    });
  }

  addBtnClick() {
    this.drawerOpened = true;
    this.customer = new Customer();
  }

  closeBtnClick() {
    this.drawerOpened = false;
    this.customer = new Customer();
  }
}
