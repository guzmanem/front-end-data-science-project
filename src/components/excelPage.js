import herokuIcon from '../icons/heroku.svg'
import reactIcon from '../icons/react.svg'
import netlifyIcon from '../icons/netlify.svg'
import flaskIcon from '../icons/flask.png'
import React, { Component } from "react";
import { Table, Button, Popconfirm, Row, Col, Icon, Upload } from "antd";
import { ExcelRenderer } from "react-excel-renderer";
import { EditableFormRow, EditableCell } from "../utils/editable";
import excel_sample from '../excel/Excel_Ejemplo.xlsx'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/main.scss'
import Test from './graphs/test'

export default class ExcelPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cols: [],
      rows: [],
      count: 0,
      addExcel: false,
      addRow: false,
      viewTable: true,
      viewGraph: false,
      viewStat: false,
      errorMessage: null,
      errorFlash: [],
      columnsTypes: {
        "name": "string",
        "age":"number",
        "gender":"string",
        "score":"number",
        "institute":"string"
      },
      columnsTrans:{
        "name": "Nombre",
        "age":"Edad",
        "gender":"Género",
        "score":"Puntaje",
        "institute":"Instituto"
      },
      columns: [
        {
          title: "ID",
          dataIndex: "key",
          editable: false
        },
        {
          title: "Nombre",
          dataIndex: "name",
          editable: true
        },
        {
          title: "Edad",
          dataIndex: "age",
          editable: true
        },
        {
          title: "Género",
          dataIndex: "gender",
          editable: true
        },
        {
          title: "Puntaje",
          dataIndex: "score",
          editable: true
        },
        {
          title: "Instituto",
          dataIndex: "institute",
          editable: true
        },
        {
          title: "Acciones",
          dataIndex: "action",
          render: (text, record) =>
            this.state.rows.length >= 1 ? (
              <Popconfirm
                title="¿Estás seguro de eliminarlo?"
                onConfirm={() => this.handleDelete(record.key)}
              >
                <Icon
                  type="delete"
                  theme="filled"
                  style={{ color: "red", fontSize: "20px" }}
                />
              </Popconfirm>
            ) : null
        }
      ]
    };
  }

  handleSave = row => {
    const newData = [...this.state.rows];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row
    });
    this.setState({ rows: newData });
    this.setState({ errorFlash: [] })
  };

  checkFile(file) {
    this.setState({ errorFlash: [] })
    let errorMessage = "";
    if (!file || !file[0]) {
      return;
    }
    const isExcel =
      file[0].type === "application/vnd.ms-excel" ||
      file[0].type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (!isExcel) {
      errorMessage = "Solo puedes subir archivos excel";
    }
    console.log("file", file[0].type);
    const isLt2M = file[0].size / 1024 / 1024 < 2;
    if (!isLt2M) {
      errorMessage = "El archivo tiene que ser menor a 2mb";
    }
    console.log("errorMessage", errorMessage);
    return errorMessage;
  }

  fileHandler = fileList => {
    this.setState({ errorFlash: [] })
    console.log("fileList", fileList);
    let fileObj = fileList;
    this.setState({ addExcel: true, addRow: true })
    if (!fileObj) {
      this.setState({
        errorMessage: "Ningú archivo fue subido"
      });
      return false;
    }
    console.log("fileObj.type:", fileObj.type);
    if (
      !(
        fileObj.type === "application/vnd.ms-excel" ||
        fileObj.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ) {
      this.setState({
        errorMessage: "Formato desconocido. Solo se permite archivos excel."
      });
      return false;
    }
    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        let newRows = [];
        resp.rows.slice(1).map((row, index) => {
          if (row && row !== "undefined") {
            newRows.push({
              key: index,
              name: row[0],
              age: row[1],
              gender: row[2]
            });
          }
        });
        if (newRows.length === 0) {
          this.setState({
            errorMessage: "No hay datos en el archivo"
          });
          return false;
        } else {
          this.setState({
            cols: resp.cols,
            rows: newRows,
            errorMessage: null
          });
        }
      }
    });
    return false;
  };

  
  handleSubmit = () => {
    this.setState({ errorFlash: [] })
    let data = this.state.rows
    let types = this.state.columnsTypes
    let trans = this.state.columnsTrans
    let messages = []
    debugger
    data.forEach( (row) => {
      for(var key in row) {
        if(key==='key' || key==='prediction'){
          continue
        }
        if(Object.keys(row).length - 1 <= Object.keys(types).length){
          messages.push('El registro ' + row['key'] + ' necesita tener todos los valores')
          break
        }
        if(typeof(row[key])!==types[key]){
          if(types[key] == 'string' && isNaN(String(row[key]))){
            messages.push('El registro ' + row['key'] + ' necesita un tipo texto en ' + trans[key] )
            break
          }
          if(types[key] == 'number' && isNaN(Number(row[key]))){
            messages.push('El registro ' + row['key'] + ' necesita un tipo número en ' + trans[key] )
            break
          }
        }
      }
    });
    if(messages.length > 0){
      this.setState({ errorFlash: messages})
    } else {
      console.log("aun falta")
    }
    //submit to API
    //if successful, banigate and clear the data
    //this.setState({ rows: [] })
  };

  handleDelete = key => {
    const rows = [...this.state.rows];
    this.setState({ rows: rows.filter(item => item.key !== key) });
    if(this.state.rows.length == 1) {
      this.setState({ addRow: false, addExcel: false });
    }
    this.setState({ errorFlash: [] })
  };

  handleDeleteAll = key => {
    const rows = [...this.state.rows];
    this.setState({ rows: [], addExcel: false, addRow:false });
    this.setState({ errorFlash: [] })
  };

  setTable = () => {
    this.setState({ viewTable: true, viewGraph: false, viewStat: false })
  }

  setGraph = () => {
    this.setState({ viewTable: false, viewGraph: true, viewStat: false })
  }

  setStat = () => {
    this.setState({ viewTable: false, viewGraph: false, viewStat: true })
  }

  handleAdd = () => {
    const { count, rows } = this.state;
    const newData = {
      key: this.state.count,
      name: "Nombre del Alumno",
      age: 0,
      gender: "Hombre / Mujer",
      score: 0,
      institute: 'Nombre Instituto',
      prediction: Math.floor(Math.random() * 2)
    };
    this.setState({
      addRow: true,
      rows: [newData, ...rows],
      count: this.state.count + 1
    });
    this.setState({ errorFlash: [] })
  };

  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell
      }
    };
    const columns = this.state.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave
        })
      };
    });
    const notify =  (messages) => {
      messages.forEach((element) =>{
        toast.error(element, {
          position: "top-right",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: 1,
          })
      })
    }
    return (
      <>
        {(this.state.errorFlash.length > 0) && (
          <ToastContainer
          position="top-right"
          autoClose={10000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          onLoad={notify(this.state.errorFlash)} />
        )}
        <header>
          <h1>Ingreso a la Educación Superior</h1>
        </header>
        <body>
        <Row gutter={5} style={{ marginTop: 30, marginLeft: 65, marginRight: 40}} justify='space-between' align='middle'>
          <Col span={16}>
            {!this.state.addExcel && (
              <Button
                className='primary'
                onClick={this.handleAdd}
                size="large"
                type="primary">
                <Icon type="plus" />
                Agregar registro
              </Button>
            )}
            {!this.state.addRow && (
              <Upload
                fileList=''
                name="file"
                beforeUpload={this.fileHandler}
                onRemove={() => this.setState({ rows: [], addExcel: false })}
                multiple={false}>
                <Button
                  className='sucess'
                  size="large"
                  type="none"
                  style={{ marginLeft: 6}}>
                  <Icon type="upload" /> Cargar Excel
                </Button>
              </Upload>
            )}
          </Col>
          <Col span={8} justify="end">
            {(this.state.addRow || this.state.addExcel) && (
              <Button
                onClick={this.handleDeleteAll}
                className='warning'
                size="large"
                type="none">
                <Icon type="undo" /> Reiniciar Todo
              </Button>
            )}
            <Button
              className='sucess'
              size="large"
              type="none"
              style={{ marginLeft: 10 }} >
                <a
                  href={excel_sample}
                  target="_blank"
                  rel="noopener noreferrer"
                  download>
                  <Icon type="download" /> Excel de Ejemplo
                </a>
            </Button>
            <Button
              className='primary'
              onClick={this.handleSubmit}
              size="large"
              type="none"
              style={{ marginLeft: 10 }}
            >
              <Icon type="upload" /> Ejecutar Predicción
            </Button>
          </Col>
        </Row>

        <Row style={{ marginTop: 30, textAlign: 'center'}} justify='space-between' >
          <Col span={8}>
            <Button
              className='menu'
              size="large"
              type="none"
              block="True"
              onClick={this.setTable}
            >
              Tabla
            </Button>
            
          </Col>
          <Col span={8}>
            <Button
              className='menu'
              size="large"
              type="none"
              block="True"
              onClick={this.setGraph}
            >
              Gráficos
            </Button>
          </Col>
          <Col span={8}>
            <Button
              className='menu'
              size="large"
              type="none"
              block="True"
              onClick={this.setStat}
            >
              Estadísticas
            </Button>
          </Col>  
        </Row>


        {(this.state.viewTable) && (
          <div style={{ marginTop: 0 , marginLeft: 0, marginRight: 0}}>
            <Table
              locale={{ emptyText: 'Sin Datos' }}
              className="table-striped-rows"
              components={components}
              rowClassName={() => "editable-row"}
              dataSource={this.state.rows}
              columns={columns}
              size="small"
              bordered
            />
          </div>
        )}

        {(this.state.viewGraph) && (
          <div style={{ marginTop: 0 , marginLeft: 0, marginRight: 0}}>
            {/* <Test></Test> */}
          </div>
        )}

        {(this.state.viewStat> 0) && (
          <div style={{ marginTop: 0 , marginLeft: 0, marginRight: 0}}>
            test2
          </div>
        )}


        </body>
        <footer>
          <Col span={12} className='container'>
            <h3>Analytics 11 <span>&#169;</span></h3>
          </Col>
          <Col span={12} className='container'>
              <h3>
                Tecnologías Utilizadas &nbsp;
                <img src={herokuIcon} style={{ height: '17.5px', width: '17.5px' }}/> &nbsp;
                <img src={reactIcon} style={{ height: '17.5px', width: '17.5px' }}/> &nbsp;
                <img src={netlifyIcon} style={{ height: '17.5px', width: '17.5px' }}/> &nbsp;
                <img src={flaskIcon} style={{ height: '17.5px', width: '17.5px' }}/> 
              </h3>
          </Col>
        </footer>
      </>
    );
  }
}
