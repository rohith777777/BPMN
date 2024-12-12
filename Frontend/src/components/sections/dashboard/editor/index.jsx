import React, { useEffect, useRef, useState } from 'react';
// import BpmnJS from 'bpmn-js/lib/Modeler';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  CreateAppendAnythingModule,
  CreateAppendElementTemplatesModule
} from 'bpmn-js-create-append-anything';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule
} from 'bpmn-js-properties-panel';
import BpmnColorPickerModule from 'bpmn-js-color-picker';
import executableFixModule from 'bpmn-js-executable-fix';
// import ConnectorsExtensionModule from 'bpmn-js-connectors-extension';
import zeebeModdle from "zeebe-bpmn-moddle/resources/zeebe.json";
import {
  ElementTemplatesPropertiesProviderModule, // Camunda 7 Element Templates
  CloudElementTemplatesPropertiesProviderModule // Camunda 8 Element Templates
} from 'bpmn-js-element-templates';
import ElementTemplateChooserModule from '@bpmn-io/element-template-chooser';

import ZeebeBehaviorModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import example from '../../../../element-templates/example.json';

// import 'bpmn-js-connectors-extension/dist/connectors-extension.css';
import '@bpmn-io/element-template-chooser/dist/element-template-chooser.css';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { createDiagrams, getDiagrams, updateDiagrams } from 'services/DiagramServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsSpin, faCirclePlus, faFolderOpen, faMagnifyingGlassPlus, faMagnifyingGlassMinus, faArrowsToCircle, faDownload, faPaintBrush, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Editor = () => {
  const defaultXML = `<?xml version="1.0" encoding="UTF-8"?>
  <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" targetNamespace="" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL http://www.omg.org/spec/BPMN/2.0/20100501/BPMN20.xsd">
    <process id="Process_1yuxzxm" isExecutable="false">
      <startEvent id="Event_01mvdix" />
    </process>
    <bpmndi:BPMNDiagram id="sid-74620812-92c4-44e5-949c-aa47393d3830">
      <bpmndi:BPMNPlane id="sid-cdcae759-2af7-4a6d-bd02-53f3352a731d" bpmnElement="Process_1yuxzxm">
        <bpmndi:BPMNShape id="Event_01mvdix_di" bpmnElement="Event_01mvdix">
          <omgdc:Bounds x="112" y="52" width="36" height="36" />
        </bpmndi:BPMNShape>
      </bpmndi:BPMNPlane>
      <bpmndi:BPMNLabelStyle id="sid-e0502d32-f8d1-41cf-9c4a-cbb49fecf581">
        <omgdc:Font name="Arial" size="11" isBold="false" isItalic="false" isUnderline="false" isStrikeThrough="false" />
      </bpmndi:BPMNLabelStyle>
      <bpmndi:BPMNLabelStyle id="sid-84cb49fd-2f7c-44fb-8950-83c3fa153d3b">
        <omgdc:Font name="Arial" size="12" isBold="false" isItalic="false" isUnderline="false" isStrikeThrough="false" />
      </bpmndi:BPMNLabelStyle>
    </bpmndi:BPMNDiagram>
  </definitions>
  `;
  const bpmnRef = useRef(null);
  const bpmnModeler = useRef(null);
  const propertiesRef = useRef(null);
  const [diagramID, setDiagramID] = useState('');
  const [diagramList, setDiagramList] = useState([]);
  const [xml, setXML] = useState(defaultXML);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState('xml');
  const [openHelpModal, setOpenHelpModal] = useState(false); // State to control help modal visibility

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        let content = e.target.result;
        // Remove BOM if present
        content = content.replace(/^\uFEFF/, '');
        console.log('File content:', content); // Log the content for debugging

        if (content && content.trim().length > 0) {
          try {
            await bpmnModeler.current.importXML(content);
            setNotification({
              open: true,
              message: 'Diagram loaded successfully',
              severity: 'success',
            });
          } catch (error) {
            console.error('Error loading diagram:', error);
            setNotification({
              open: true,
              message: 'Failed to load diagram',
              severity: 'error',
            });
          }
        } else {
          setNotification({
            open: true,
            message: 'The uploaded file is empty or invalid.',
            severity: 'error',
          });
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
      reader.readAsText(file);
    }
  };

  const zoomIn = () => {
    const canvas = bpmnModeler.current.get('canvas');
    const currentZoom = canvas.zoom();
    canvas.zoom(currentZoom * 1.2);
  };

  const zoomOut = () => {
    const canvas = bpmnModeler.current.get('canvas');
    const currentZoom = canvas.zoom();
    canvas.zoom(currentZoom / 1.2);
  };

  const centerDiagram = () => {
    const canvas = bpmnModeler.current.get('canvas');
    canvas.zoom('fit-viewport');
  };

  const handleDiagramSelect = (diagramID) => {
    setDiagramID(diagramID);
    const selectedXml = diagramList.find((item) => item.id === diagramID);
    setXML(selectedXml ? selectedXml.xml : '');
  };

  // const fetchDiagrams = async () => {
  //   try {
  //     const response = await getDiagrams();
  //     if (response.data.status) {
  //       const res_data = response.data.data;
  //       setDiagramList(res_data);
  //       setDiagramID(res_data[0].id);
  //       const selectedXml = res_data.find((item) => item.id === res_data[0].id);
  //       setXML(selectedXml ? selectedXml.xml : '');
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const createNewDiagrams = async () => {
    const payload = {
      diagramID: diagramID,
    };
    // const response = await createDiagrams(payload);
    // console.log("createDiagrams: ", response);
    // await fetchDiagrams();
    bpmnModeler.current.importXML(defaultXML);
    setXML(defaultXML);
  };

  const saveDiagram = async (xml) => {
    try {
      const payload = {
        id: diagramID,
        xml: xml,
      };
      const response = await updateDiagrams(payload);
      if (response.data.status) {
        setNotification({
          open: true,
          message: 'Diagram saved successfully',
          severity: 'success',
        });
      } else {
        setNotification({
          open: true,
          message: 'Failed to save diagram',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
      setNotification({
        open: true,
        message: 'Failed to save diagram',
        severity: 'error',
      });
    }
  };

  const debouncedSave = debounce(saveDiagram, 1000);

  const showTemplateErrors = (errors) => {
    console.error('Failed to parse element templates', errors);

    const errorMessage = `Failed to parse element templates:
  
      ${errors.map(error => error.message).join('\n    ')}
  
      Check the developer tools for details.`;

    document.querySelector('.error-panel pre').textContent = errorMessage;
    document.querySelector('.error-panel').classList.toggle('hidden');
  }

  useEffect(() => {
    if (bpmnRef.current) {
      // bpmnModeler.current = new BpmnJS({
      //   container: bpmnRef.current,
      // });
      bpmnModeler.current = new BpmnModeler({
        container: bpmnRef.current,
        propertiesPanel: {
          parent: propertiesRef.current,
        },
        additionalModules: [
          CreateAppendAnythingModule,
          CreateAppendElementTemplatesModule,
          BpmnColorPickerModule,
          executableFixModule,
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          ElementTemplatesPropertiesProviderModule,
          // ConnectorsExtensionModule,
          CloudElementTemplatesPropertiesProviderModule,
          ElementTemplateChooserModule,
          ZeebePropertiesProviderModule,
          ZeebeBehaviorModule
        ],
        appendAnything: true,
        elementTemplateChooser: true,
        moddleExtensions: {
          zeebe: zeebeModdle
        }
      });

      bpmnModeler.current.on('elementTemplates.errors', event => {

        const { errors } = event;

        showTemplateErrors(errors);
      });

      bpmnModeler.current.get('elementTemplatesLoader').setTemplates(example);

      const eventBus = bpmnModeler.current.get('eventBus');
      const canvas = bpmnModeler.current.get('canvas');

      const handleChanged = async () => {
        if (bpmnModeler.current) {
          try {
            const { xml } = await bpmnModeler.current.saveXML({ format: true });
            debouncedSave(xml);
          } catch (error) {
            console.error('Error getting XML:', error);
          }
        }
      };

      const changeEvents = [
        'elements.changed',
        'element.updateLabel',
        'shape.remove',
        'connect.end',
        'shape.moved',
        'shape.added',
        'connection.added',
        'connection.removed',
        'bendpoint.added',
        'bendpoint.removed',
        'bendpoint.moved',
      ];

      changeEvents.forEach((eventName) => {
        eventBus.on(eventName, handleChanged);
      });

      const loadDiagram = async () => {
        if (bpmnModeler.current) {
          try {
            const result = await bpmnModeler.current.importXML(xml);
            const { warnings } = result;
            if (warnings.length) {
              console.warn('BPMN import warnings:', warnings);
            }
            canvas.zoom('fit-viewport');
          } catch (error) {
            console.error('Error loading diagram:', error);
          }
        }
      };

      loadDiagram();

      return () => {
        changeEvents.forEach((eventName) => {
          eventBus.off(eventName, handleChanged);
        });
        if (bpmnModeler.current) {
          bpmnModeler.current.destroy();
        }
      };
    }
  }, [xml]);

  useEffect(() => {
    // fetchDiagrams();
  }, []);

  const clearCanvas = () => {
    // const modeling = bpmnModeler.current.get('modeling');
    // const elementRegistry = bpmnModeler.current.get('elementRegistry');
    // const allElements = elementRegistry.getAll();
    // // Remove each element from the canvas using the modeling service
    // allElements.forEach((element) => {
    //   modeling.removeElements([element]);
    // });
    bpmnModeler.current.importXML(defaultXML);
    setNotification({
      open: true,
      message: 'Canvas cleared successfully',
      severity: 'success',
    });
  };

  const downloadDiagramAsXML = async () => {
    try {
      const { xml } = await bpmnModeler.current.saveXML({ format: true });
      const blob = new Blob([xml], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.bpmn';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading diagram as XML:', error);
    }
  };

  const downloadDiagramAsGIF = async () => {
    const canvasElement = bpmnRef.current;
    const canvas = await html2canvas(canvasElement);
    const dataURL = canvas.toDataURL('image/gif');
    const blob = await (await fetch(dataURL)).blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.gif';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    if (downloadFormat === 'xml') {
      await downloadDiagramAsXML();
    } else if (downloadFormat === 'gif') {
      await downloadDiagramAsGIF();
    }
    setOpenDialog(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'n': // New diagram
          createNewDiagrams();
          break;
        case 'o': // Open diagram
          document.getElementById('file-upload').click(); // Trigger file input
          break;
        case 'z': // Zoom In
          zoomIn();
          break;
        case 'Z': // Zoom Out (Shift + z)
          zoomOut();
          break;
        case 'e': // Center diagram
          centerDiagram();
          break;
        case 'd': // Download
          setOpenDialog(true);
          break;
        case 'c': // Clear canvas
          clearCanvas();
          break;
        case 'h': // Show help modal
          setOpenHelpModal(true);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <Paper
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          '& .djs-palette': {
            position: 'absolute',
            left: 0,
            top: 0,
          },
          '& .djs-container': {
            width: '100%',
            height: '100%',
          },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          mt={-0.5}
          mb={0.5}
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6" color="text.secondary">
            BPMN Editor{''}
            <FormControl sx={{ minWidth: 120 }} size="small">
              {/* <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                sx={{ width: 360, margin: "0 0 0 20px" }}
                value={diagramID}
                onChange={(e) => handleDiagramSelect(e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {diagramList.map((item, index) => (
                  <MenuItem key={index} value={item.id}>
                    <em>{item.id}</em>
                  </MenuItem>
                ))}
              </Select> */}
            </FormControl>
          </Typography>
          <Box
            sx={{ border: "1px solid #CCCCCC", background: "#EEEEEE" }}
          >
            <FontAwesomeIcon
              icon={faCirclePlus}
              onClick={createNewDiagrams}
              style={{ fontSize: '20px', cursor: 'pointer', margin: '0 5px' }}
              title="Create New Diagram"
            />
            <input
              type="file"
              accept=".bpmn"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload" style={{ fontSize: '20px', cursor: 'pointer', margin: '0 9px 0px 15px' }} title="Upload Diagram">
              <FontAwesomeIcon icon={faFolderOpen} />
            </label>
            <FontAwesomeIcon
              icon={faMagnifyingGlassPlus}
              onClick={zoomIn}
              style={{ fontSize: '20px', cursor: 'pointer', margin: '0 10px' }}
              title="Zoom In"
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlassMinus}
              onClick={zoomOut}
              style={{ fontSize: '20px', cursor: 'pointer', margin: '0 9px' }}
              title="Zoom Out"
            />
            <FontAwesomeIcon
              icon={faArrowsToCircle}
              onClick={centerDiagram}
              style={{ fontSize: '20px', cursor: 'pointer', margin: '0 9px' }}
              title="Center Diagram"
            />
            <FontAwesomeIcon
              icon={faDownload}
              onClick={() => setOpenDialog(true)}
              style={{ fontSize: '20px', cursor: 'pointer', margin: '0 10px' }}
              title="Download Diagram"
            />
            <FontAwesomeIcon
              icon={faArrowsSpin}
              onClick={clearCanvas}
              style={{ fontSize: '20px', cursor: 'pointer', margin: '0 10px' }}
              title="Clear Canvas"
            />
            <FontAwesomeIcon
              icon={faCircleInfo}
              onClick={() => setOpenHelpModal(true)}
              style={{ fontSize: '20px', cursor: 'pointer', margin: '0 10px' }}
              title="Help"
            />
          </Box>
        </Stack>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          mt={-0.5}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box
            ref={bpmnRef}
            sx={{
              mt: { xs: 1.5, sm: 0.75 },
              width: "100%",
              height: 900,
              border: "1px solid black",
              position: 'relative',
              '& .djs-palette': {
                position: 'absolute',
                left: 0,
                top: 0,
              },
            }}
          />
          <Box
            ref={propertiesRef}
            sx={{
              mt: { xs: 1.5, sm: 0.75 },
              height: 900,
              border: "solid black",
              borderWidth: "1px 1px 1px 0px",
              position: 'relative',
              '& .djs-palette': {
                position: 'absolute',
                left: 0,
                top: 0,
              },
            }}
          />
        </Stack>
      </Paper>
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Select Download Format</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <Select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
            >
              <MenuItem value="xml">Download as XML</MenuItem>
              <MenuItem value="gif">Download as GIF</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDownload} color="primary">
            Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Modal */}
      <Dialog open={openHelpModal} onClose={() => setOpenHelpModal(false)}>
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogContent>
          <Typography>
            <ul>
              <li><strong>N:</strong> New diagram</li>
              <li><strong>O:</strong> Open diagram</li>
              <li><strong>Z:</strong> Zoom in</li>
              <li><strong>Shift + Z:</strong> Zoom out</li>
              <li><strong>E:</strong> Center diagram</li>
              <li><strong>B:</strong> Toggle brush tool</li>
              <li><strong>D:</strong> Download diagram</li>
              <li><strong>C:</strong> Clear canvas</li>
              <li><strong>H:</strong> Show this help modal</li>
            </ul>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHelpModal(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Editor;