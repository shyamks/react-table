import React, {Component} from 'react';
import '../css/FileInput.css'
import ConsoleTable from './ConsoleTable';
import {Constants} from '../../Constants';
import {Button} from 'react-bootstrap';

const columns = ["name","email","phone","cityid","locationid","budgetmin","budgetmax","projectid","campaign","platform"];

let cleanString = (string) => {
    return string.replace(/"/g, "");
};

let cleanStringArray = (arrayOfStrings) => {
    for (let i = 0; i < arrayOfStrings.length; i++) {
        arrayOfStrings[i] = cleanString(arrayOfStrings[i]);
    }
    return arrayOfStrings
};

let csvFormatter = (csv) => {
    let n = csv.split('\n');
    let titles = (n.splice(0, 1)[0]).split(',');
    titles = (titles.map((title)=>{
        return cleanString(title.split(' ').join('').toLowerCase());
    }));
    let lastHeader = titles.pop();
    console.log(lastHeader);
    console.log(titles);
    titles = cleanStringArray(titles);
    let objects = [], count = 0;
    for (let line in n) {
        let items = n[line].split(',');
        items = cleanStringArray(items);
        let lastElement = items.pop();
        let obj = {};
        obj[Constants.MASTER_ID] = count + 1;
        for (let i in titles) {
            if (items[i] === undefined){
                obj[titles[i]] = "";
            }
            else {
                obj[titles[i]] = items[i];
            }
        }
        obj["platform"] = lastElement;
        objects.push(obj);
        count++;
    }
    // console.log(objects);
    return objects;
};

function validate(csv){
    let row = csv.split('\n');
    let header = row[0].split(',');
    header = cleanStringArray(header);
    header = header.map((element) =>{
        return element.split(' ').join('').toLowerCase();
    });
    header.pop();
    header.push("platform");
    console.log(header,columns);
    for (let i=0;i<columns.length;i++){
        if(columns[i] !== header[i]){
            return false;
        }
    }
    return true;
}

class ExcelReader extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.fillTable = this.fillTable.bind(this);
        this.clearTable = this.clearTable.bind(this);
        this.state = {
            tableObjects: []
        }
    }

    clearTable() {
        this.setState({
            tableObjects: []
        })
    }

    fillTable(csv) {
        let objectArray = csvFormatter(csv);
        let tempVar = this.state;
        tempVar.tableObjects = objectArray;
        this.setState(tempVar);
    }

    handleChange(event) {
        let files = event.target.files;
        if (files.length === 1) {
            let reader = new FileReader();
            reader.onload = function () {
                let csv = reader.result;
                if (validate(csv) === true){
                    this.fillTable(csv);
                }
                else{
                    alert("Please check the table format of the csv uploaded.")
                }
            }.bind(this);
            reader.readAsText(files[0], 'UTF-8');
        }
        event.target.value = null;
    }


    render() {
        let consoleTable;
        if (this.state.tableObjects.length > 0) {
            consoleTable = (
                <div>
                    <ConsoleTable products={this.state.tableObjects}/>
                </div>);
        }
        else {
            consoleTable = <div/>;
        }

        return (
            <form>
                <Button bsStyle="primary" className="selectFileButton" type="file">Choose
                    the file...<input type="file" accept=".csv" className="selectInputFileButton"
                                      onChange={this.handleChange}/></Button>
                <Button bsStyle="info" className="clearButton" onMouseDown={this.clearTable}> Clear </Button>
                {consoleTable}
            </form>
        );
    }

}

export default ExcelReader;
