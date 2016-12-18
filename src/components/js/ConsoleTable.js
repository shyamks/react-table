import React from 'react';
import '../css/ConsoleTable.css';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import '../css/Submit.css'
import {Constants} from '../../Constants';
import {Button} from 'react-bootstrap';

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const NUM_REGEX = /^[0-9]+$/;
const PHONE_REGEX = /^\d{10}$/;

// function getKeyElement(keys) {
//     let indexPop;
//     for (let i in keys) {
//         if (keys[i] === Constants.MASTER_ID) {
//             indexPop = i;
//         }
//     }
//     return {keyElement: keys[indexPop], indexPop: indexPop};
// }



function getBoolCell(field, boolRow, row) {
    if (field === Constants.MASTER_ID) {
        boolRow[field] = row[field];
    }
    else if (field.toLowerCase() === Constants.EMAIL) {
        boolRow[field] = EMAIL_REGEX.test(row[field]);
    }
    else if (field.toLowerCase() === Constants.BUDGETMIN || field.toLowerCase() === Constants.BUDGETMAX || (/^.*id$/i).test(field)){
        boolRow[field] = NUM_REGEX.test(row[field]);
    }
    else if (field.toLowerCase() === Constants.PHONE) {
        boolRow[field] = PHONE_REGEX.test(row[field]);
    }
    else
        boolRow[field] = true;
    return boolRow;
}
function getBoolRow(row) {
    let obj = {};
    for (let field in row) {
        obj = getBoolCell(field, obj, row);
    }
    return obj;
}

function updateBoolTable(table, boolTable, row) {
    let index = row[Constants.MASTER_ID] - 1;
    boolTable[index] = getBoolRow(table[index]);
    return boolTable;
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
    table[index] = row;
    return table;
}

function getBoolSubmit(booltable) {
    let count = 0;
   
    for (let row in booltable) {
        for (let field in booltable[row]) {
            if (field !== Constants.MASTER_ID){
                if (!booltable[row][field]) {
                    console.log(booltable[row], field);
                    count = 1;
                    break;
                }
            }
        }
        if (count === 1)
                break;
    }
    console.log("boolsubmit :" + count);
    return count !== 1;
}
function getRowObject(row){
    for (let field in row){
        row[field] = ""
    }
    return row;
}


class ConsoleTable extends React.Component {

    constructor(props) {
        super(props);
        let table = props.products;
        let boolTable = getBoolTable(table);
        let boolSubmit = getBoolSubmit(boolTable);
        let rowObject = getRowObject(boolTable[boolTable.length - 1]);
        this.state = {
            table: table,
            boolTable: boolTable,
            submit: boolSubmit,
            selectedRows: [],
            rowObject: rowObject
        };
        console.log(this.state);
        this.afterSaveCell = this.afterSaveCell.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.renderTable = this.renderTable.bind(this);
        this.handleRowSelect = this.handleRowSelect.bind(this);
        this.handleSelectAll = this.handleSelectAll.bind(this);
        this.deleteSelectedRows = this.deleteSelectedRows.bind(this);
        this.alertPopper = this.alertPopper.bind(this);
        // this.insertRow = this.insertRow.bind(this);
    }
    

    afterSaveCell(row, cellName, cellValue) {
        let tempState = {};
        let boolTable = this.state.boolTable;
        let table = this.state.table;
        boolTable = updateBoolTable(table, boolTable, row);
        let tempSubmit = getBoolSubmit(boolTable);
        tempState.boolTable = boolTable;
        table = updateTableRow(table, row);
        tempState.table = table;
        tempState.submit = tempSubmit;
        console.log(tempState);
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
            console.log(tempTable[rowIndex][Constants.MASTER_ID], parseInt(rowIndex) + 1);
        }
        tempState.table = tempTable;
        tempState.boolTable = tempBoolTable;
        tempState.submit = getBoolSubmit(tempBoolTable);
        tempState.selectedRows = [];
        console.log(tempState);
        this.setState(tempState);
    }

    handleRowSelect(row, isSelected, e) {
        console.log(row, isSelected, e);
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
        console.log(rowsSelected);
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
        console.log(rowsSelected);
        this.setState(tempState);
    }

    onSubmit(e) {
        if (confirm("Are you sure you want to submit this?") === true) {
            let tempState = this.state;
            tempState.table = [];
            this.setState(tempState);
        }
        else {
            console.log(this.state);
        }
    }
    alertPopper(e){
        console.log(this.state);
        alert("Please fill the mandatory(*) fields in all the rows.");
    }

    render() {
        const cellEditProp = {
            mode: 'click',
            afterSaveCell: this.afterSaveCell,
        };
        // const selectRow = {
        //     mode: 'checkbox'
        // };
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
        if (productsProp.length > 0) {
            // let keys = Object.keys(productsProp[0]), indexPop;
            // let keyInfo = getKeyElement(keys);
            // let keyElement = keyInfo.keyElement, button;
            // indexPop = keyInfo.indexPop;
            // keys.splice(indexPop, 1);
            // tableColumns = keys.map((key) => {
            //     return <TableHeaderColumn dataField={key} width='150' dataAlign="center"
                    //                       key={key} dataFormat={(cell, row) => {
                    // {/*console.log(row, cell);*/
                    // }
                    // let index = row[Constants.MASTER_ID] - 1;
                    // if (!this.state.boolTable[index][key])
                    //     return <i className="warning">{cell}</i>;
                    // return <div>{cell}</div>;
            //     }}>{key}</TableHeaderColumn> <Button bsStyle="primary" onMouseDown={this.insertRow}>Insert Row</Button>
            // });
            if (this.state.submit) {
                button = <div className="submit"> 
                 <Button bsStyle="primary" onMouseDown={this.onSubmit}>Submit</Button></div>;
            }
            else {
                button = <div className="submit"> 
                 <Button bsStyle="primary" onMouseDown={this.alertPopper}>Submit</Button></div>;
            }
            table = (
                <div>
                    <BootstrapTable data={ productsProp } options={options} cellEdit={ cellEditProp }
                                    selectRow={ selectRow } key={"haha"}
                                    maxHeight="480px" deleteRow >
                        <TableHeaderColumn dataField='id' isKey={true} width='150' dataAlign="center"
                                           key='id'>Id</TableHeaderColumn>
                        <TableHeaderColumn dataField='datecreated'  width='150' dataAlign="center"
                                           key='datecreated' dataFormat={(cell, row) => {
                                                {/*console.log(row, cell);*/
                                                }
                                                let index = row[Constants.MASTER_ID] - 1;
                                                if (!this.state.boolTable[index]['id'])
                                                    return <i className="warning">{cell}</i>;
                                                return <div>{cell}</div>;}
                                            }>Datecreated</TableHeaderColumn>
                        <TableHeaderColumn dataField='name' width='150' dataAlign="center"
                                           key='name' dataFormat={(cell, row) => {
                                                {/*console.log(row, cell);*/
                                                }
                                                let index = row[Constants.MASTER_ID] - 1;
                                                if (!this.state.boolTable[index]["name"])
                                                    return <i className="warning">{cell}</i>;
                                                return <div>{cell}</div>;}
                                            }>*Name</TableHeaderColumn>
                        <TableHeaderColumn dataField='email' width='150' dataAlign="center"
                                           key='email' dataFormat={(cell, row) => {
                                                {/*console.log(row, cell);*/
                                                }
                                                let index = row[Constants.MASTER_ID] - 1;
                                                if (!this.state.boolTable[index]["email"])
                                                    return <i className="warning">{cell}</i>;
                                                return <div>{cell}</div>;}
                                            }>*Email</TableHeaderColumn>
                        <TableHeaderColumn dataField='phone' width='150' dataAlign="center"
                                           key='phone' dataFormat={(cell, row) => {
                                                {/*console.log(row, cell);*/
                                                }
                                                let index = row[Constants.MASTER_ID] - 1;
                                                if (!this.state.boolTable[index]["phone"])
                                                    return <i className="warning">{cell}</i>;
                                                return <div>{cell}</div>;}
                                            }>*Phone</TableHeaderColumn>
                        <TableHeaderColumn dataField='cityid' width='150' dataAlign="center"
                                           key='cityid' dataFormat={(cell, row) => {
                                                {/*console.log(row, cell);*/
                                                }
                                                let index = row[Constants.MASTER_ID] - 1;
                                                if (!this.state.boolTable[index]["cityid"])
                                                    return <i className="warning">{cell}</i>;
                                                return <div>{cell}</div>;}
                                            }>*Cityid</TableHeaderColumn>
                        <TableHeaderColumn dataField='city' width='150' dataAlign="center"
                                           key='city' dataFormat={(cell, row) => {
                                                {/*console.log(row, cell);*/
                                                }
                                                let index = row[Constants.MASTER_ID] - 1;
                                                if (!this.state.boolTable[index]["city"])
                                                    return <i className="warning">{cell}</i>;
                                                return <div>{cell}</div>;}
                                            }>City</TableHeaderColumn>
                        <TableHeaderColumn dataField='locationid' width='150' dataAlign="center"
                                           key='locationid' dataFormat={(cell, row) => {
                                                {/*console.log(row, cell);*/
                                                }
                                                let index = row[Constants.MASTER_ID] - 1;
                                                if (!this.state.boolTable[index]["locationid"])
                                                    return <i className="warning">{cell}</i>;
                                                return <div>{cell}</div>;}
                                            }>*LocationId</TableHeaderColumn>
                        <TableHeaderColumn dataField='location' width='150' dataAlign="center"
                                           key='location' dataFormat={(cell, row) => {
                                                {/*console.log(row, cell);*/
                                                }
                                                let index = row[Constants.MASTER_ID] - 1;
                                                if (!this.state.boolTable[index]["location"])
                                                    return <i className="warning">{cell}</i>;
                                                return <div>{cell}</div>;}
                                            }>Location</TableHeaderColumn>
                        <TableHeaderColumn dataField='budgetmin'  width='150' dataAlign="center"
                                           key='budgetmin' dataFormat={(cell, row) => {
                                                {/*console.log(row, cell);*/
                                                }
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
                        <TableHeaderColumn dataField='project' width='150' dataAlign="center"
                                           key='project' dataFormat={(cell, row) => {
                                                let index = row[Constants.MASTER_ID] - 1;
                                                if (!this.state.boolTable[index]["project"])
                                                    return <i className="warning">{cell}</i>;
                                                return <div>{cell}</div>;}
                                            }>Project</TableHeaderColumn>
                        <TableHeaderColumn dataField='campaign' width='150' dataAlign="center"
                                           key='campaign' dataFormat={(cell, row) => {
                                                let index = row[Constants.MASTER_ID] - 1;
                                                if (!this.state.boolTable[index]["campaign"])
                                                    return <i className="warning">{cell}</i>;
                                                return <div>{cell}</div>;}
                                            }>Campaign</TableHeaderColumn>
                        <TableHeaderColumn dataField='source' width='150' dataAlign="center"
                                           key='source' dataFormat={(cell, row) => {
                                                let index = row[Constants.MASTER_ID] - 1;
                                                if (!this.state.boolTable[index]["source"])
                                                    return <i className="warning">{cell}</i>;
                                                return <div>{cell}</div>;}
                                            }>Source</TableHeaderColumn>
                        <TableHeaderColumn dataField='platform' width='150' dataAlign="center"
                                           key='platform' dataFormat={(cell, row) => {
                                                let index = row[Constants.MASTER_ID] - 1;
                                                if (!this.state.boolTable[index]["platform"])
                                                    return <i className="warning">{cell}</i>;
                                                return <div>{cell}</div>;}
                                            }>Platform</TableHeaderColumn>
                    </BootstrapTable>
                    {button}
                </div>
            );
        }
        else
            table = (<div></div>);
        return table;
    }
}

export default ConsoleTable;