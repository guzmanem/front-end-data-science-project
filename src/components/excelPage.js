import herokuIcon from '../icons/heroku.svg'
import reactIcon from '../icons/react.svg'
import netlifyIcon from '../icons/netlify.svg'
import flaskIcon from '../icons/flask.png'
import React, { Component } from "react";
import { Table, Button, Popconfirm, Row, Col, Icon, Upload } from "antd";
import { ExcelRenderer } from "react-excel-renderer";
import { EditableFormRow, EditableCell } from "../utils/editable";
import excel_sample from '../excel/GuiaIngresoEducSuperior.xlsx'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/main.scss'
import { CSVLink } from 'react-csv'
import Graph from './graphs/graph'
import axios from "axios";
import { color } from 'd3';


export default class ExcelPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cols: [],
      rows: [],
      disabledTograph: true,
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
        "key": "ID",
        "name": "Nombre",
        "average_psu": "PSU",
        "average_nem": "NEM",
        "prom_notas_alu": "4to Medio",
        "cod_pro_rbd": "Provincia",
        "cod_depe2": "Dependencia",
        "rural_rbd": "Ruralidad",
        "cod_ense": "Enseñanza",
        "cod_jor": "Jornada",
        "cod_des_cur": "Curso",
        "gen_alu": "Sexo",
        "edad_alu": "Edad",
        "alums_pref": "Pref. (Aula)",
        "alums_prior": "Prioritarios (Aula)",
        "alumns_class": "Alumnos (Aula)",
        "prediction": 'Ingreso'
      },
      columnsGraph:{
        "key": "same",
        "name": "same",
        "average_psu": "histogram",
        "average_nem": "histogram",
        "prom_notas_alu": "histogram",
        "cod_pro_rbd": "barplot",
        "cod_depe2": "barplot",
        "rural_rbd": "barplot",
        "cod_ense": "barplot",
        "cod_jor": "barplot",
        "cod_des_cur": "barplot",
        "gen_alu": "barplot",
        "edad_alu": "barplot",
        "alums_pref": "histogram",
        "alums_prior": "histogram",
        "alumns_class": "histogram",
        "prediction": 'Ingreso'
      },
      columns: [
        {
          title: "ID",
          dataIndex: "key",
          editable: false,
          width: 50
        },
        {
          title: "Nombre",
          dataIndex: "name",
          editable: true,
          width: 100
        },
        {
          title: "PSU",
          dataIndex: "average_psu",
          editable: true,
          width: 100
        },
        {
          title: "NEM",
          dataIndex: "average_nem",
          editable: true,
          width: 100
        },
        {
          title: "4to Medio",
          dataIndex: "prom_notas_alu",
          editable: true,
          width: 100
        },
        {
          title: "Provincia",
          dataIndex: "cod_pro_rbd",
          editable: true,
          width: 100
        },
        {
          title: "Dependencia",
          dataIndex: "cod_depe2",
          editable: true,
          width: 100
        },
        {
          title: "Ruralidad",
          dataIndex: "rural_rbd",
          editable: true,
          width: 100
        },
        {
          title: "Enseñanza",
          dataIndex: "cod_ense",
          editable: true,
          width: 100
        },
        {
          title: "Jornada",
          dataIndex: "cod_jor",
          editable: true,
          width: 100
        },
        {
          title: "Curso",
          dataIndex: "cod_des_cur",
          editable: true,
          width: 100
        },
        {
          title: "Sexo",
          dataIndex: "gen_alu",
          editable: true,
          width: 100
        },
        {
          title: "Edad",
          dataIndex: "edad_alu",
          editable: true,
          width: 100
        },
        {
          title: "Pref. (Aula)",
          dataIndex: "alums_pref",
          editable: true,
          width: 150
        },
        {
          title: "Prioritarios (Aula)",
          dataIndex: "alums_prior",
          editable: true,
          width: 150
        },
        {
          title: "Alumnos (Aula)",
          dataIndex: "alumns_class",
          editable: true,
          width: 150
        },
        {
          title: "Ingreso",
          dataIndex: "prediction",
          editable: false,
          width: 100,
          render: (text, record) =>
          this.state.rows.length >= 1 ? (
            <p style={{ color: text == "No Ingresa" ? "red" : "green"}}>
              {text}
            </p>
          ) : null
        },
        {
          title: "Acciones",
          dataIndex: "action",
          width: 100,
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
    this.setState({ addExcel: true, addRow: true, disabledTograph: true })
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
              average_psu: row[1],
              average_nem: row[2],
              prom_notas_alu: row[3],
              cod_pro_rbd: row[4],
              cod_depe2: row[5],
              rural_rbd: row[6],
              cod_ense: row[7],
              cod_jor: row[8],
              cod_des_cur: row[9],
              gen_alu: row[10],
              edad_alu: row[11],
              alums_pref: row[12],
              alums_prior: row[13],
              alumns_class: row[14],
              prediction: ''
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
        if(Object.keys(row).length + 1 <= Object.keys(types).length){
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
      this.setState({ errorFlash: messages, disabledTograph: true })
    } else {
      var rows = this.state.rows
      axios.post("https://api-data-science-project.herokuapp.com/api/v1/",{
        header: {
          "Access-Control-Allow-Origin": 'front-end'
        },
        body: rows})
      .then(response => {
        var new_data = this.state.rows.map((element, index)=>{
          var pred = response["data"][index]
          element['prediction'] = pred == 0 ? "No Ingresa" :  "Ingresa"
          return element
        })
        this.setState({ rows: new_data, successFlash: ['Se cargaron las predicciones correctamente.'], disabledTograph: false })
      })
      .catch(err => {
        this.setState({ errorFlash: ['Error inesperado obteniendo las predicciones.'], disabledTograph: true})
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
    this.setState({ errorFlash: [], successFlash: [], disabledTograph: true })
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
      count: this.state.count + 1,
      disabledTograph: true
    });
    this.setState({ errorFlash: [], successFlash: [] })
  };

  predictionData = (data) =>{
    if(data == "Ingresa"){
      return 1
    } else {
      return 0
    }
  }

  rurarlidad = {
    "cod_pro_rbd":{
      "11": "Iquique",
      "14": "Tamarugal",
      "21": "Antofagasta",
      "22": "El Loa",
      "23": "Tocopilla",
      "31": "Copiapo",
      "32": "Chañaral",
      "33": "Huasco",
      "41": "Elqui",
      "42": "Choapa",
      "43": "Limari",
      "51": "Valparaiso",
      "52": "Isla de Pascua",
      "53": "Los Andes",
      "54": "Petorca",
      "55": "Quillota",
      "56": "San Antonio",
      "57": "San Felipe de Aconcagua",
      "58": "Marga Marga",
      "61": "Cachapoal",
      "62": "Cardenal Caro",
      "63": "Colchagua",
      "71": "Talca",
      "72": "Cauquenes",
      "73": "Curico",
      "74": "Linares",
      "81": "Concepcion",
      "82": "Arauco",
      "83": "Biobío",
      "84": "Ñuble",
      "91": "Cautín",
      "92": "Malleco",
      "101": "Llanquihue",
      "102": "Chiloé",
      "103": "Osorno",
      "104": "Palena",
      "111": "Coyhaique",
      "112": "Aysén",
      "113": "Capitán Prat",
      "114": "General Carrera",
      "121": "Magallanes",
      "122": "Antártica Chilena",
      "123": "Tierra del Fuego",
      "124": "Última Esperanza",
      "131": "Santiago",
      "132": "Cordillera",
      "133": "Chacabuco",
      "134": "Maipo",
      "135": "Melipilla",
      "136": "Talagante",
      "141": "Valdivia",
      "142": "Ranco",
      "151": "Arica",
      "152": "Parinacota",
      "161": "Diguillin",
      "162": "Itata",
      "163": "Punilla"
    },
    "cod_depe2": {
      "2": "Subvencionado",
      "3": "Pagado",
      "4": "Corporación"
    },
    "rural_rbd": {
      "0": "Urbano",
      "1": "Rural"
    },
    "cod_ense": {
      "363": "Adultos",
      "310": "Jóvenes",
      "410": "Comercial Jóvenes",
      "463": "Comercial Adultos",
      "510": "Industrial Jóvenes",
      "563": "Industrial Adultos",
      "610": "Técnica Jóvenes",
      "663": "Técnica Adultos",
      "710": "Agrícola Jóvenes",
      "763": "Agrícola Adultos",
      "810": "Marítima Jóvenes",
      "863": "Marítima Adultos",
      "910": "Artística Jóvenes"
    },
    "cod_jor": {
      "1": "Mañana",
      "2": "Tarde",
      "3": "Mañana / Tarde",
      "4": "Vespertina / Nocturna"
    },
    "cod_des_cur": {
      "0": "No aplica",
      "1": "Liceo",
      "2": "Dual",
      "3": "Otro"
    },
    "gen_alu": {
      "0": "Sin información",
      "1": "Hombre",
      "2": "Mujer"
    },
    "edad_alu": {
      "1": "1",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7",
      "8": "8",
      "9": "9",
      "10": "10",
      "11": "11",
      "12": "12",
      "13": "13",
      "14": "14",
      "15": "15",
      "16": "16",
      "17": "17",
      "18": "18",
      "19": "19",
      "20": "20",
      "21": "21",
      "22": "22",
      "23": "23",
      "24": "24",
      "25": "25",
      "26": "26",
      "27": "27",
      "28": "28",
      "29": "29",
      "30": "30",
      "31": "31",
      "32": "32",
      "33": "33",
      "34": "34",
      "35": "35",
      "36": "36",
      "37": "37",
      "38": "38",
      "39": "39",
      "40": "40",
      "41": "41",
      "42": "42",
      "43": "43",
      "44": "44",
      "45": "45",
      "46": "46",
      "47": "47",
      "48": "48",
      "49": "49",
      "50": "50",
      "51": "51",
      "52": "52",
      "53": "53",
      "54": "54",
      "55": "55",
      "56": "56",
      "57": "57",
      "58": "58",
      "59": "59",
      "60": "60",
      "61": "61",
      "62": "62",
      "63": "63",
      "64": "64",
      "65": "65",
      "66": "66",
      "67": "67",
      "68": "68",
      "69": "69",
      "70": "70",
      "71": "71",
      "72": "72",
      "73": "73",
      "74": "74",
      "75": "75",
      "76": "76",
      "77": "77",
      "78": "78",
      "79": "79",
      "80": "80",
      "81": "81",
      "82": "82",
      "83": "83",
      "84": "84",
      "85": "85",
      "86": "86",
      "87": "87",
      "88": "88",
      "89": "89",
      "90": "90",
      "91": "91",
      "92": "92",
      "93": "93",
      "94": "94",
      "95": "95",
      "96": "96",
      "97": "97",
      "98": "98",
      "99": "99",
      "100": "100",
      "101": "101",
      "102": "102",
      "103": "103",
      "104": "104",
      "105": "105",
      "106": "106",
      "107": "107",
      "108": "108",
      "109": "109",
      "110": "110",
      "111": "111",
      "112": "112",
      "113": "113",
      "114": "114",
      "115": "115",
      "116": "116",
      "117": "117",
      "118": "118",
      "119": "119",
      "120": "120",
      "121": "121",
      "122": "122",
      "123": "123",
      "124": "124",
      "125": "125",
      "126": "126",
      "127": "127",
      "128": "128",
      "129": "129",
      "130": "130",
      "131": "131",
      "132": "132",
      "133": "133",
      "134": "134",
      "135": "135",
      "136": "136",
      "137": "137",
      "138": "138",
      "139": "139",
      "140": "140",
      "141": "141",
      "142": "142",
      "143": "143",
      "144": "144"
    }
  }

  dataGraph = (event) =>{
    var type = this.state.columnsGraph[event.target.value]
    if(type == 'histogram'){
      var data = this.state.rows.map( (element) =>{
        return {type: this.predictionData(element.prediction), value: element[event.target.value] }
      })
      this.setState({ dataToGraph: data, typeDataToGraph: type})
    } else { 
      var dict = {}
      this.state.rows.forEach( (element) =>{
        if(dict[element[event.target.value]] !== undefined){
          if(element.prediction == "Ingresa"){
            dict[element[event.target.value]]['Ingreso'] += 1
          } else {
            dict[element[event.target.value]]['NoIngreso'] += 1
          }
        } else{ 
          if(element.prediction == "No Ingresa"){
            dict[element[event.target.value]] = { group: this.rurarlidad[event.target.value][element[event.target.value]] , Ingreso: 1, NoIngreso: 0}
          } else {
            dict[element[event.target.value]] = { group: this.rurarlidad[event.target.value][element[event.target.value]] , Ingreso: 0, NoIngreso: 1}
          }
        }
      })
      data = []
      const values = Object.values(dict)
      for (const value of values){
        data.push(value)
      }
      this.setState({ dataToGraph: data, typeDataToGraph: type, dataSubgroup: ["Ingreso", "NoIngreso"], successFlash: [], errorFlash: [] } )
    }
  }

  dataExport = (data) => {
    var array = []
    data.forEach((row) => {
      var dict_tmp = {}
      for(var key in row) {
        dict_tmp[this.state.columnsTrans[key]] = row[key]
      }
      array.push(dict_tmp)
    })
    return array
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
        if ((element.dataIndex == 'key') || (element.dataIndex =='action') || (element.dataIndex == 'prediction') || (element.dataIndex == 'name')){
          return false
        } else {
          return true
        }
      }
    ))
  
    var listColumns= (
      <div className='bulgy-radios' onChange={this.dataGraph}>
        {columnsToGraph.map( (element) => (
          <label>
            <input type="radio" value={element.dataIndex} name='columnsToGraph' /><span class="radio"></span><span class="label">{element.title}</span>
          </label>
        ))}
      </div>
    );


  
    return (
      <div style={{position: 'relative', minHeight: '100vh'}}>
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
        <div style= {{paddingBottom: '7.5em'}}>
          <header>
            <h1>Ingreso a la Educación Superior</h1>
          </header>
          <body>
            <div className="row" style={{ marginTop: "1.5em", marginLeft: 0, marginRight: 0, marginBottom: '1.5em', textAlign: 'center', witdh:'100%'}}>
              <div className="col-lg-6 px-0" style={{ marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: 0, textAlign: 'center', witdh:'100%'}}>
                {!this.state.addExcel && (
                  <Button
                    className='primary'
                    onClick={this.handleAdd}
                    disabled={!this.state.viewTable}
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
                      className='sucess below-button-1'
                      size="large"
                      type="none"
                      disabled={!this.state.viewTable}
                      style={{ marginLeft: 6}}>
                      <Icon type="upload" /> Cargar Excel
                    </Button>
                  </Upload>
                )}
              </div>
              <div className="col-lg-6 px-0 below-buttons" style={{ marginTop: 0, marginLeft: 0, marginRight: 0, marginBottom: 0, textAlign: 'center', witdh:'90%'}}>
                {(this.state.addRow || this.state.addExcel) && (
                  <Button
                    onClick={this.handleDeleteAll}
                    className='warning'
                    size="large"
                    type="none"
                    disabled={!this.state.viewTable}>
                    <Icon type="undo" /> Reiniciar Todo
                  </Button>
                )}
                <Button
                  className={((this.state.addRow || this.state.addExcel) ? 'sucess below-button-2' : 'sucess')}
                  size="large"
                  type="none"
                  disabled={!this.state.viewTable}
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
                  className={((this.state.addRow || this.state.addExcel) ? 'primary below-button-2 below-button-3' : 'primary below-button-2')}
                  onClick={this.handleSubmit}
                  size="large"
                  type="none"
                  style={{ marginLeft: 10 }}
                  disabled={!this.state.viewTable}
                >
                  <Icon type="upload" /> Ejecutar Predicción
                </Button>
              </div>
            </div>

            <div className='row' style={{ marginTop: 0, textAlign: 'center', width: '100%', marginLeft: '0', marginRight: '0'}}>
              <div className='col-md-6 px-0 mx-0'>
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
              <div className='col-md-6 px-0 mx-0'>
                <Button
                  className='menu'
                  size="large"
                  type="none"
                  block="True"
                  onClick={this.setGraph}
                  disabled={this.state.disabledTograph}
                >
                  Gráficos
                </Button>
              </div>
            </div>

          {(this.state.viewTable) && (
            <div style={{ marginTop: 0 , marginLeft: 0, marginRight: 0, marginBottom: 0, paddingBottom: 0, textAlign: 'center', backgroundColor: '#eeeeee !important'}} className="table px-0 mx-0" >
              <Table
                locale={{ emptyText: 'Sin Datos' }}
                className="table-striped-rows"
                components={components}
                rowClassName={() => "editable-row"}
                dataSource={this.state.rows}
                columns={columns}
                size="small"
                bordered
                pagination={{ pageSize: 5 }}
                scroll={{
                  x: 1500
                }}
              />
            </div>
          )}

          {(this.state.viewTable && (this.state.addRow || this.state.addExcel)) && (
            <div className='col-md-1 offset-md-1'>
              <Button className='export'
                  size="large"
                  type="none"
                  block="True" >
                <CSVLink data={this.dataExport(this.state.rows)} filename='IngresoEducSuperiorResultados.xlsx'>Exportar</CSVLink>
              </Button>
            </div>
          )}

          {(this.state.viewGraph) && (
            
            <div className="row" style={{ marginTop: "1.5em", marginLeft: 0, marginRight: 0, marginBottom: '1.5em', textAlign: 'center', witdh:'100%'}}>
              <div className="col-lg-4">
                {listColumns}
              </div>
              <div className="col-lg-8" tyle={{ paddingTop: "1.5em", paddingLeft: 0, paddingRight: 0, paddingBottom: '1.5em', textAlign: 'center', witdh:'100%'}}>
                <Graph data ={this.state.dataToGraph} type={this.state.typeDataToGraph} subgroups={this.state.dataSubgroup}></Graph>
              </div>
            </div>
          )}

          </body>
        </div>
        <footer style={{ width: "100%", position: 'absolute', bottom: 0, height: '6rem'}}>
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
      </div>
    );
  }
}
