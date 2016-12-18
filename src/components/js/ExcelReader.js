import React, {Component} from 'react';
import '../css/FileInput.css'
import ConsoleTable from './ConsoleTable';
import {Constants} from '../../Constants';
import {Button} from 'react-bootstrap';


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
            // console.log(titles[i],obj);
        }
        // lastHeader = cleanString(lastHeader);
        // if(lastHeader)
            // obj["platform"] = lastElement;
        // else
            obj["platform"] = lastElement;
        // console.log(Object.keys(obj),obj);
        objects.push(obj);
        count++;
    }
    // console.log(objects);
    return objects;
};


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
        console.log(files[0]);
        if (files.length === 1) {
            let reader = new FileReader();
            reader.onload = function () {
                let csv = reader.result;
                this.fillTable(csv);
            }.bind(this);
            reader.readAsText(files[0], 'UTF-8');
        }
        else if (files.length > 1) {
            console.log("Too many files");
        }
        event.target.value = event.target.defaultValue;
    }


    render() {
        let consoleTable;
        console.log(this.state.tableObjects.length);
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
