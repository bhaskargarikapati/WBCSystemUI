import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent } from '../common/confirm-dialog/confirm-dialog.component';
import { GlobalConstants } from '../common/global-constants';
import { modelDialog, tableOperation, Transporter } from '../models';
import { AlertService } from '../services';
import { TransactionsService } from './transactions.service';

@Component({
  selector: 'app-transporters',
  templateUrl: './transactionlist.component.html',
  styleUrls: ['./transactionlist.component.scss'],
})
export class TransactionsListComponent implements OnInit {
  tblColumns: string[] = [
    'transporterCode',
    'nameOfTransporter',
    'contactPerson',
    'mobileNo',
    'telephoneNo',
    'faxNo',
    'address',
    'Actions',
  ];
  tableData: any = [];

  public searchInput: string = '';
  public staticText: any = {};
  public actionName: string = '';
  public sortColumn = { name: 'Name', dir: 'asc' };
  public visibleColumns = ['sequenceNo', 'nameOfTransporter', 'Actions'];

  constructor(
    private translate: TranslateService,
    private matDialog: MatDialog,
    private httpService: TransactionsService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.getTranslatedText();
    this.getAllTransactions();
  }

  selectedRecord(actionData: tableOperation): void {
    this.actionName = actionData.action;

    const dialogData = {
      actionName: this.actionName,
      headerText: 'Information',
      data: actionData.data,
    };

    if (this.actionName === 'delete') {
      this.deleteDialog(dialogData);
    } else if (this.actionName === 'edit') {
      this.router.navigate(['/dashboard/transactions/add'], { queryParams: { id: dialogData.data?.transporterCode } });
    } else {
      this.router.navigate(['/dashboard/transactions/add'],  {relativeTo: this.route});
    }     
   
  }

  searchValueChanged(value: string) {
    this.searchInput = value;
  }


  private deleteDialog(dialogData: modelDialog): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = dialogData;
    dialogConfig.data.message = 'Are you sure you want to delete this item ?';
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;

    const dialogRef = this.matDialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      this._deleteRecord(dialogData.data);
    });
  }

  private _deleteRecord(selRecord: Transporter) {
    this.httpService.deleteTransporter(selRecord.transporterCode).subscribe({
      next: (res) => {
        console.log('Deleted Record !!', selRecord);
        this.getAllTransactions();
      },
      error: (e) => {
        console.error(e)
      },
    });
  }


  private getTranslatedText(): void {
    this.translate.get(['']).subscribe((translated: string) => {
      this.staticText = {
        searchPlaceholder: this.translate.instant(
          'placeholder.searchtransporters'
        ),
      };
    });
  }

  private getAllTransactions(): void {
    this.httpService.getAllTransporters().subscribe({
      next: (data: Transporter[]) => {
        this.tableData = data;
      },
      error: (error) => {
        console.log(error);
        this.alertService.error(error);
      },
    });
  }

 
}