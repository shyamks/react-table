import React from 'react';
import '../css/ConsoleTable.css';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import '../css/Submit.css'
import {Constants} from '../../Constants';
import {Button} from 'react-bootstrap';
import Spinner from 'react-spinner';

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const NUM_REGEX = /^[0-9]+$/;
const PHONE_REGEX = /^\d{10}$/;

function preProcessTable(table){
    for(let i in table){
        for(let field in table[i]){
            table[i][field] = table[i][field].toString().trim(); 
        }
    }
    return table;
}
function getBoolCell(field, boolRow, row) {
    if (field === Constants.MASTER_ID) {
        boolRow[field] = row[field];
    }
    else if(field.toLowerCase() === Constants.PROJECT_ID){
        boolRow[field] = NUM_REGEX.test(row[field])
    }
    else if ((/^.*id$/gi).test(field)) {
        if(row[field] === "" || NUM_REGEX.test(row[field]))
            boolRow[field] = true;
        else{
            boolRow[field] = false;
        }
        
    }
    else if (field.toLowerCase() === Constants.EMAIL) {
        boolRow[field] = EMAIL_REGEX.test(row[field]);
    }
    else if (field.toLowerCase() === Constants.BUDGETMIN || field.toLowerCase() === Constants.BUDGETMAX){
        boolRow[field] = NUM_REGEX.test(row[field]);
    }
    else if (field.toLowerCase() === Constants.PHONE) {
        boolRow[field] = PHONE_REGEX.test(row[field]);
    }
    else if (field.toLowerCase() === Constants.PLATFORM) {
        boolRow[field] = (row[field].toLowerCase() === "cf" || row[field].toLowerCase() === "web");
    }
    else
        boolRow[field] = true;
    // console.log(boolRow);
    return boolRow;
}
function getBoolRow(row) {
    let obj = {};
    for (let field in row) {
        obj = getBoolCell(field, obj, row);
    }
    return obj;
}

function getBoolTable(table) {
    let boolTable = [];
    for (let row in table) {
        boolTable.push(getBoolRow(table[row]));
    }
    return boolTable;
}

function updateTableRow(table, row) {
    let index = row[Constants.MASTER_ID] - 1;
    for(let field in row){
        row[field] = row[field].toString().trim();
    }
    table[index] = row;
    return table;
}

function getBoolSubmit(booltable) {
    let count = false;
    for (let row in booltable) {
        for (let field in booltable[row]) {
            if (field !== Constants.MASTER_ID){
                if (!booltable[row][field]) {
                    count = true;
                    break;
                }
            }
        }
        if (count)
                break;
    }
    return !count;
}
function getRowObject(row){
    for (let field in row){
        row[field] = ""
    }
    return row;
}

function requestObj(arr){
    let obj = {}
    obj["priceMax"] = parseInt(arr["budgetmax"]);
    obj["priceMin"] = parseInt(arr["budgetmin"]);
    obj["cityId"] = parseInt(arr["cityid"]);
    obj["emailId"] = arr["email"];
    obj["userName"] = arr["name"];
    obj["locationId"] = parseInt(arr["locationid"]);
    obj["campaignId"] = arr["campaign"];
    obj["projectId"] = parseInt(arr["projectid"]);
    obj["channel"] = arr["platform"].toUpperCase();
    obj["medium"] = "desktop";
    obj["userId"] = "";
    obj["source"] = "MARKETING_EXTERNAL";
    obj["phone"] = arr["phone"];
    return obj;
}



function storeCall(data){
    let BASEURL = "";
    if (process.env.NODE_ENV === 'production')
        BASEURL = "http://192.168.40.51:9001";
    fetch(BASEURL + '/realestate/v1/createRequirement', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Quikr-Client': 'realestate.api'
        },
        body: JSON.stringify(data)
    })
    .then((response) => console.log(response))
    .catch((error) => {
        console.log(error);
    });
}

class ConsoleTable extends React.Component {

    constructor(props) {
        super(props);
        let table = props.products;
        table = preProcessTable(table);
        let boolTable = getBoolTable(table);
        let boolSubmit = getBoolSubmit(boolTable);
        let rowObject = getRowObject(boolTable[boolTable.length - 1]);
        
        this.state = {
            table: table,
            boolTable: boolTable,
            submit: boolSubmit,
            selectedRows: [],
            rowObject: rowObject,
            showLoading: false
        };
        this.initialState = this.state;
        this.afterSaveCell = this.afterSaveCell.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.renderTable = this.renderTable.bind(this);
        this.handleRowSelect = this.handleRowSelect.bind(this);
        this.handleSelectAll = this.handleSelectAll.bind(this);
        this.deleteSelectedRows = this.deleteSelectedRows.bind(this);
        this.alertPopper = this.alertPopper.bind(this);
    }
    

    afterSaveCell(row, cellName, cellValue) {
        let tempState = {};
        let boolTable = this.state.boolTable;
        let table = this.state.table;
        table = updateTableRow(table, row);
        let index = row[Constants.MASTER_ID] -1;
        let newBoolRow = getBoolCell(cellName,boolTable[index],table[index]);
        boolTable[index] = newBoolRow;
        let tempSubmit = getBoolSubmit(boolTable);
        tempState.boolTable = boolTable;
        tempState.table = table;
        tempState.submit = tempSubmit;
        this.setState(tempState);
        return true;
    }

    deleteSelectedRows() {
        let tempState = this.state;
        for (let rowIndex in tempState.selectedRows) {
            tempState.table.splice(tempState.selectedRows[rowIndex], 1);
            tempState.boolTable.splice(tempState.selectedRows[rowIndex], 1)
        }
        let tempTable = tempState.table;
        let tempBoolTable = tempState.boolTable;
        for (let rowIndex in tempTable) {
            tempTable[rowIndex][Constants.MASTER_ID] = parseInt(rowIndex) + 1;
            tempBoolTable[rowIndex][Constants.MASTER_ID] = parseInt(rowIndex) + 1;
        }
        tempState.table = tempTable;
        tempState.boolTable = tempBoolTable;
        tempState.submit = getBoolSubmit(tempBoolTable);
        tempState.selectedRows = [];
        this.setState(tempState);
    }

    handleRowSelect(row, isSelected, e) {
        let tempState = this.state;
        let rowsSelected = tempState.selectedRows;
        let index = row[Constants.MASTER_ID] - 1;
        if (isSelected)
            rowsSelected.push(index);
        else {
            rowsSelected = rowsSelected.filter((ele) => {
                return ele !== index;
            });
        }
        tempState.selectedRows = rowsSelected;
        this.setState(tempState);
    }

    handleSelectAll(isSelected, rows) {
        let tempState = this.state;
        let rowsSelected = tempState.selectedRows;
        if (isSelected) {
            for (let i in rows)
                rowsSelected.push(rows[i][Constants.MASTER_ID] - 1);
        }
        else {
            rowsSelected = [];
        }
        tempState.selectedRows = rowsSelected;
        this.setState(tempState);
    }

    onSubmit(e) {
        e.preventDefault();
        if (confirm("Are you sure you want to submit this?") === true) {
            let tempState = this.state;
            let table = tempState.table;
            tempState.showLoading = true;
            tempState.table = [];
            this.setState(tempState);
            let data;
            for(let i in table){
                data = requestObj(table[i]);    
                storeCall(data);
            }
            this.setState({
                showLoading: false
            });
            
        }
    }
    alertPopper(e){
        alert("Please fill the mandatory(*) fields in all the rows.");
    }

    render() {
        const cellEditProp = {
            mode: 'click',
            afterSaveCell: this.afterSaveCell,
        };
        const selectPropRow = {
            mode: 'checkbox',
            onSelect: this.handleRowSelect,
            onSelectAll: this.handleSelectAll,
            className: 'cell-background'
        };
        const options = {
            onDeleteRow: this.deleteSelectedRows
        };
        let productsProp = this.state.table;
        let table = this.renderTable(productsProp, options, cellEditProp, selectPropRow);
        return (
            <div>{table}</div>
        );
    }

    renderTable(productsProp, options, cellEditProp, selectRow) {
        let table,button;
        if (productsProp.length > 0 ) {
            if (this.state.submit) {
                button =  
                 <Button bsStyle="primary" className="submitButtonSizeLarge" onMouseDown={this.onSubmit}>Submit</Button>;
            }
            else {
                button = 
                 <Button bsStyle="primary" className="submitButtonSizeSmall" onMouseDown={this.alertPopper}>Submit</Button>;
            }
                table = (
                    <div>
                        <BootstrapTable data={ productsProp } options={options} cellEdit={ cellEditProp }
                                        selectRow={ selectRow } key={"haha"}
                                        maxHeight="450px" deleteRow >
                            <TableHeaderColumn dataField='id' isKey={true} width='150' dataAlign="center"
                                            key='id'>Id</TableHeaderColumn>
                            <TableHeaderColumn dataField='name' width='150' dataAlign="center"
                                            key='name' dataFormat={(cell, row) => {
                                                    let index = row[Constants.MASTER_ID] - 1;
                                                    if (!this.state.boolTable[index]["name"])
                                                        return <i className="warning">{cell}</i>;
                                                    return <div>{cell}</div>;}
                                                }>*Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='email' width='150' dataAlign="center"
                                            key='email' dataFormat={(cell, row) => {
                                                    let index = row[Constants.MASTER_ID] - 1;
                                                    if (!this.state.boolTable[index]["email"])
                                                        return <i className="warning">{cell}</i>;
                                                    return <div>{cell}</div>;}
                                                }>*Email</TableHeaderColumn>
                            <TableHeaderColumn dataField='phone' width='150' dataAlign="center"
                                            key='phone' dataFormat={(cell, row) => {
                                                    let index = row[Constants.MASTER_ID] - 1;
                                                    if (!this.state.boolTable[index]["phone"])
                                                        return <i className="warning">{cell}</i>;
                                                    return <div>{cell}</div>;}
                                                }>*Phone</TableHeaderColumn>
                            <TableHeaderColumn dataField='cityid' width='150' dataAlign="center"
                                            key='cityid' dataFormat={(cell, row) => {
                                                    let index = row[Constants.MASTER_ID] - 1;
                                                    if (!this.state.boolTable[index]["cityid"])
                                                        return <i className="warning">{cell}</i>;
                                                    return <div>{cell}</div>;}
                                                }>Cityid</TableHeaderColumn>
                            
                            <TableHeaderColumn dataField='locationid' width='150' dataAlign="center"
                                            key='locationid' dataFormat={(cell, row) => {
                                                    let index = row[Constants.MASTER_ID] - 1;
                                                    if (!this.state.boolTable[index]["locationid"])
                                                        return <i className="warning">{cell}</i>;
                                                    return <div>{cell}</div>;}
                                                }>LocationId</TableHeaderColumn>
                            
                            <TableHeaderColumn dataField='budgetmin'  width='150' dataAlign="center"
                                            key='budgetmin' dataFormat={(cell, row) => {
                                                    let index = row[Constants.MASTER_ID] - 1;
                                                    if (!this.state.boolTable[index]["budgetmin"])
                                                        return <i className="warning">{cell}</i>;
                                                    return <div>{cell}</div>;}
                                                }>Budgetmin</TableHeaderColumn>
                            <TableHeaderColumn dataField='budgetmax' width='150' dataAlign="center"
                                            key='budgetmax' dataFormat={(cell, row) => {
                                                    let index = row[Constants.MASTER_ID] - 1;
                                                    if (!this.state.boolTable[index]["budgetmax"])
                                                        return <i className="warning">{cell}</i>;
                                                    return <div>{cell}</div>;}
                                                }>Budgetmax</TableHeaderColumn>
                            <TableHeaderColumn dataField='projectid' width='150' dataAlign="center"
                                            key='projectid' dataFormat={(cell, row) => {
                                                    let index = row[Constants.MASTER_ID] - 1;
                                                    if (!this.state.boolTable[index]["projectid"])
                                                        return <i className="warning">{cell}</i>;
                                                    return <div>{cell}</div>;}
                                                }>*Projectid</TableHeaderColumn>
                            <TableHeaderColumn dataField='campaign' width='150' dataAlign="center"
                                            key='campaign' dataFormat={(cell, row) => {
                                                    let index = row[Constants.MASTER_ID] - 1;
                                                    if (!this.state.boolTable[index]["campaign"])
                                                        return <i className="warning">{cell}</i>;
                                                    return <div>{cell}</div>;}
                                                }>Campaign</TableHeaderColumn>
                            <TableHeaderColumn dataField='platform' width='150' dataAlign="center"
                                            key='platform' dataFormat={(cell, row) => {
                                                    let index = row[Constants.MASTER_ID] - 1;
                                                    if (!this.state.boolTable[index]["platform"])
                                                        return <i className="warning">{cell}</i>;
                                                    return <div>{cell}</div>;}
                                                }>*Platform</TableHeaderColumn>
                        </BootstrapTable>
                        {button}
                    </div>
                );
            }
        else{
            if (this.state.showLoading)
                table = (<Spinner />);
            else
                table = (<div></div>);
        }
        return table;
    }
}

export default ConsoleTable;