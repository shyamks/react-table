import React, {Component} from 'react';
import ExcelReader from './components/js/ExcelReader';

class App extends Component {

    render() {
        return (
            <div>
                <h3 className="manualReqUpload">Manual Requirement Upload</h3>
                <ExcelReader/>
            </div>
        );
    }
}

export default App;
