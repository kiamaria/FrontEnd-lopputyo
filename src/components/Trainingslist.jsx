import React, { useState, useEffect, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-material.css";
import "ag-grid-community/styles/ag-grid.css";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { Input } from "@mui/base/Input";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import "dayjs/locale/fi";

import moment from "moment";

const style = {
  position: "absolute",
  top: "50%",
  marginTop: 10,
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function Traininglist() {
  const [trainings, setTrainings] = useState([]);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState();
  const [time, setTime] = useState();
  const [duration, setDuration] = useState();
  const [activity, setActivity] = useState();
  const [customerName, setCustomerName] = useState();
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchTrainings();
  }, []);

  useEffect(() => {fetchCustomers()}, []);

  const gridRef = useRef();

  const fetchCustomers = () => {
    fetch("https://traineeapp.azurewebsites.net/api/customers")
      .then((response) => response.json())
      .then((data) => setCustomers(data.content));
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const fetchTrainings = async () => {
    let trainings = await fetch(
      "https://traineeapp.azurewebsites.net/api/trainings"
    );

    let trainingData = await trainings.json();

    let trainingWithCustomers = [];

    for (let i = 0; i < trainingData.content.length; i++) {
      let training = trainingData.content[i];

      let customerResponse = await fetch(
        training.links.find((link) => link.rel === "customer").href.replace("http:", "https:")
      );

      let customer = await customerResponse.json();

      training.customerName = customer.firstname + " " + customer.lastname;
      training.customerId = customer.id;
      training.profile = trainingWithCustomers.push(training);
    }

    setTrainings(trainingWithCustomers);

    return trainingWithCustomers;
  };

  const onDelClick = async (training) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );
    if (confirmed) {
      try {
        await fetch(training.href, {
          method: "DELETE",
        });

        fetchTrainings();
      } catch (error) {
        console.error("Error deleting training:", error);
      }
    }
  };

  const addNew = async () => {
    if (
      !date &&
      !time &&
      !duration &&
      !activity &&
      !activity &&
      !customerName
    ) {
      return;
    }

    let data = {
      date: date.toISOString(),
      activity: activity,
      duration: duration,
      customer: customerName,
    };

    try {
      await fetch("https://traineeapp.azurewebsites.net/api/trainings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.log(error);
    } finally {
      fetchTrainings();
      handleClose();
    }
  };

  const onBtnExport = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      const params = {
        processCellCallback: ({ value, column }) => {
          if (column.getColDef().field === 'date') {
            return moment(value).format('YYYY-MM-DD HH:mm'); 
          }
          return value;
        },
        processHeaderCallback: ({ column }) => {
          return column.getColDef().field; 
        },
        columnKeys: list
          .filter((col) => col.field !== 'Update' && col.headerName !== 'Delete')
          .map((col) => col.field),
      };
      gridRef.current.api.exportDataAsCsv(params);
    } else {
      console.error('Error');
    }
  }, []);
  
  

  const list = [
    {
      field: "date",
      sortable: true,
      filter: true,
      cellRenderer: (data) => {
        return moment(data.value).format("MM/DD/YYYY");
      },
    },
    {
      field: "date",
      headerName: "Time",
      sortable: true,
      filter: true,
      cellRenderer: (data) => {
        return moment(data.value).format("HH:mm");
      },
    },
    {
      field: "duration",
      headerName: "Duration (min)",
      sortable: true,
      filter: true,
    },
    {
      field: "activity",
      sortable: true,
      filter: true,
    },
    {
      field: "customerName",
      sortable: true,
      filter: true,
    },
    {
      field: "deleteField",
      headerName: "Delete",
      sortable: false,
      filterable: false,
      cellRenderer: (row) => {
        return (
          <Button
            onClick={() =>
              onDelClick(row.data.links.find((link) => link.rel === "training"))
            }
          >
            Delete
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <div
        className="ag-theme-material"
        style={{ height: "1000px", width: "70%", margin: "auto" }}
      >
        <h1>Trainings 🏋🏼</h1>
        <Button onClick={handleOpen}>Add</Button>
        <Button onClick={onBtnExport}>Export CSV</Button>
        <AgGridReact
          rowHeight={30}
          columnDefs={list}
          rowData={trainings}
          ref={gridRef}
        ></AgGridReact>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fi">
              <DateTimePicker
                label="Controlled picker"
                value={date}
                onChange={(newDate) => setDate(newDate)}
              />
            </LocalizationProvider>
            <Input
              placeholder="Duration"
              onChange={(e) => setDuration(e.target.value)}
              value={duration}
            />
            <Input
              placeholder="Activity"
              onChange={(e) => setActivity(e.target.value)}
              value={activity}
            />
            <Select
              onChange={(e) => setCustomerName(e.target.value)}
              value={customerName}
            >
              {customers.map((customer) => {
                return (
                  <MenuItem
                    key={customer.id}
                    value={
                      customer.links.find((f) => f.rel === "customer").href
                    }
                  >
                    {customer.firstname + " " + customer.lastname}
                  </MenuItem>
                );
              })}
            </Select>
            <Button onClick={addNew}>Add</Button>
          </Box>
        </Modal>
      </div>
    </>
  );
};
