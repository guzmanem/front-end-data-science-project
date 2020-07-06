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
import { CSVLink } from 'react-csv'
import Graph from './graphs/graph'
import axios from "axios";


export default class ExcelPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cols: [],
      rows: [],
      dataToGraph: [],
      dataSubgroup: [],
      typeDataToGraph: '',
      count: 0,
      addExcel: false,
      addRow: false,
      viewTable: true,
      viewGraph: false,
      errorMessage: null,
      errorFlash: [], successFlash: [],
      successFlash: [],
      columnsTypes: {
        "name": "string",
        "average_psu": "number",
        "average_nem": "number",
        "prom_notas_alu": "number",
        "cod_pro_rbd": "number",
        "cod_depe2": "number",
        "rural_rbd": "number",
        "cod_ense": "number",
        "cod_jor": "number",
        "cod_des_cur": "number",
        "gen_alu": "number",
        "edad_alu": "number",
        "alums_pref": "number",
        "alums_prior": "number",
        "alumns_class": "number",
        "prediction": 'number'
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
          title: "Promedio PSU",
          dataIndex: "average_psu",
          editable: true
        },
        {
          title: "Promedio NEM",
          dataIndex: "average_nem",
          editable: true
        },
        {
          title: "Promedio 4to Medio",
          dataIndex: "prom_notas_alu",
          editable: true
        },
        {
          title: "Instituto",
          dataIndex: "cod_pro_rbd",
          editable: true
        },
        {
          title: "Código Depedencia",
          dataIndex: "cod_depe2",
          editable: true
        },
        {
          title: "Ruralidad",
          dataIndex: "rural_rbd",
          editable: true
        },
        {
          title: "Código de Enseñanza",
          dataIndex: "cod_ense",
          editable: true
        },
        {
          title: "Descripción del Curso",
          dataIndex: "cod_des_cur",
          editable: true
        },
        {
          title: "Sexo",
          dataIndex: "gen_alu",
          editable: true
        },
        {
          title: "Edad",
          dataIndex: "edad_alu",
          editable: true
        },
        {
          title: "Alumnos Preferenciales (Aula)",
          dataIndex: "alums_pref",
          editable: true
        },
        {
          title: "Alumnos Prioritarios (Aula)",
          dataIndex: "alums_prior",
          editable: true
        },
        {
          title: "Alumnos (Aula)",
          dataIndex: "alumns_class",
          editable: true
        },
        {
          title: "Ingreso",
          dataIndex: "prediction",
          editable: false
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
    this.setState({ errorFlash: [], successFlash: [] })
  };

  checkFile(file) {
    this.setState({ errorFlash: [], successFlash: [] })
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
    this.setState({ errorFlash: [], successFlash: [] })
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
    this.setState({ errorFlash: [], successFlash: [] })
    let data = this.state.rows
    let types = this.state.columnsTypes
    let trans = this.state.columnsTrans
    let messages = []
    data.forEach( (row) => {
      for(var key in row) {
        if(key==='key' || key==='prediction'){
          continue
        }
        if(Object.keys(row).length  <= Object.keys(types).length){
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
      var rows = this.state.rows
      axios.post("https://api-data-science-project.herokuapp.com/api/v1/",{
        header: {
          "Access-Control-Allow-Origin": 'front-end'
        },
        body: rows})
      .then(response => {
        var new_data = this.state.rows.map((element, index)=>{
          element['prediction'] = response["data"][index]
          return element
        })
        this.setState({ rows: new_data, successFlash: ['Se cargaron las predicciones correctamente.'] })
      })
      .catch(err => {
        this.setState({ errorFlash: ['Error inesperado obteniendo las predicciones.']})
      });
    }
  };

  handleDelete = key => {
    const rows = [...this.state.rows];
    this.setState({ rows: rows.filter(item => item.key !== key) });
    if(this.state.rows.length == 1) {
      this.setState({ addRow: false, addExcel: false });
    }
    this.setState({ errorFlash: [], successFlash: [] })
  };

  handleDeleteAll = key => {
    const rows = [...this.state.rows];
    this.setState({ rows: [], addExcel: false, addRow:false });
    this.setState({ errorFlash: [], successFlash: [] })
  };

  setTable = () => {
    this.setState({ viewTable: true, viewGraph: false })
    this.setState({ errorFlash: [], successFlash: [] })
  }

  setGraph = () => {
    this.setState({ viewTable: false, viewGraph: true })
    this.setState({ errorFlash: [], successFlash: [] })
  }

  setStat = () => {
    this.setState({ viewTable: false, viewGraph: false })
    this.setState({ errorFlash: [], successFlash: [] })
  }

  handleAdd = () => {
    const { count, rows } = this.state;
    const newData = {
      key: this.state.count,
      name: "Nombre del Alumno",
      average_psu: 0,
      average_nem: 0,
      prom_notas_alu: 0,
      cod_pro_rbd: 0,
      cod_depe2: 0,
      rural_rbd: 0,
      cod_ense: 0,
      cod_jor: 0,
      cod_des_cur: 0,
      gen_alu: 0,
      edad_alu: 0,
      alums_pref: 0,
      alums_prior: 0,
      alumns_class: 0,
      prediction: ''
    };
    this.setState({
      addRow: true,
      rows: [newData, ...rows],
      count: this.state.count + 1
    });
    this.setState({ errorFlash: [], successFlash: [] })
  };

  dataGraph = (event) =>{
    var type = this.state.columnsTypes[event.target.value]
    if(type == 'number'){
      var data = this.state.rows.map( (element) =>{
        return {type: element.prediction, value: element[event.target.value] }
      })
      this.setState({ dataToGraph: data, typeDataToGraph: type})
    } else { 
      var dict = {}
      this.state.rows.forEach( (element) =>{
        if(dict[element[event.target.value]] !== undefined){
          if(element.prediction == 1){
            dict[element[event.target.value]]['Ingreso'] += 1
          } else {
            dict[element[event.target.value]]['NoIngreso'] += 1
          }
        } else{ 
          if(element.prediction == 1){
            dict[element[event.target.value]] = { group: element[event.target.value] , Ingreso: 1, NoIngreso: 0}
          } else {
            dict[element[event.target.value]] = { group: element[event.target.value] , Ingreso: 0, NoIngreso: 1}
          }
        }
      })
      data = []
      const values = Object.values(dict)
      for (const value of values){
        data.push(value)
      }
      this.setState({ dataToGraph: data, typeDataToGraph: type, dataSubgroup: ["Ingreso", "NoIngreso"] })
    }
  }

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
    const notify =  (messages, type) => {
      if(type === 'error'){
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
      if(type === 'success'){
        messages.forEach((element) =>{
          toast.success(element, {
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
    }

    var columnsToGraph = (
      this.state.columns.filter((element) =>{
        if ((element.title === 'key') || (element.title ==='action')){
          return false
        } else {
          return true
        }
      }
    ))
  
    var listColumns= (
      <div className='columnsList' onChange={this.dataGraph}>
        {columnsToGraph.map( (element,index) => (
          <div>
            <input type="radio" value={element.dataIndex} name='columnsToGraph' />{element.title}
          </div>
        ))}
      </div>
    );
  
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
          onLoad={notify(this.state.errorFlash, 'error')} />
        )}

        {(this.state.successFlash.length > 0) && (
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
          onLoad={notify(this.state.successFlash, 'success')} />
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

        {/* <Row style={{ marginTop: 30, textAlign: 'center'}} justify='space-between' > */}
          <div className='row' style={{ marginTop: 30, textAlign: 'center', witdh:'100%'}}>
          {/* <Col span={12}> */}
            <div className='col-md-6 px-0'>
              <Button
                className='menu'
                size="large"
                type="none"
                block="True"
                onClick={this.setTable}
              >
                Tabla
              </Button>
            </div>
          {/* </Col> */}
          {/* <Col span={12}> */}
            <div className='col-md-6 px-0'>
              <Button
                className='menu'
                size="large"
                type="none"
                block="True"
                onClick={this.setGraph}
              >
                Gráficos
              </Button>
            </div>
          </div>
          {/* </Col> */}
        {/* </Row> */}

        {/* <Row style={{ marginTop: 30, textAlign: 'center'}} justify='space-between' >
          <Col span={12}>
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
          <Col span={12}>
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
        </Row> */}


        {(this.state.viewTable) && (
          <div style={{ marginTop: 0 , marginLeft: 0, marginRight: 0}} >
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


          <div className='col-md-1 offset-md-1'>
            <Button className='export'
                size="large"
                type="none"
                block="True" >
              <CSVLink data={this.state.rows} filename='test.xlsx'>Exportar</CSVLink>
            </Button>
          </div>


        {(this.state.viewGraph) && (
          
          <div style={{ marginTop: 0 , marginLeft: 0, marginRight: 0}}>
            {listColumns}
            <Graph data ={this.state.dataToGraph} type={this.state.typeDataToGraph} subgroups={this.state.dataSubgroup}></Graph>
          </div>
        )}

        </body>
        <footer>
          <Col span={12} className='containerFooter'>
            <h3>Analytics 11 <span>&#169;</span></h3>
          </Col>
          <Col span={12} className='containerFooter'>
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
