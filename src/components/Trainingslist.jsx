import React, { useRef, useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-material.css";
import "ag-grid-community/styles/ag-grid.css";

import moment from "moment";

export default function Traininglist() {
  const [trainings, setTrainings] = useState([]);

  const gridRef = useRef();

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    let trainings = await fetch(
      "http://traineeapp.azurewebsites.net/api/trainings"
    );
    let trainingData = await trainings.json();

    let trainingWithCustomers = [];

    for (let i = 0; i < trainingData.content.length; i++) {
      let training = trainingData.content[i];
      let customerResponse = await fetch(
        training.links.find((link) => link.rel === "customer").href
      );

      let customer = await customerResponse.json();
      
      training.customerName = customer.firstname + " " + customer.lastname;

      trainingWithCustomers.push(training);
    }

    setTrainings(trainingWithCustomers);
  };

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
  ];

  return (
    <>
      <div
        className="ag-theme-material"
        style={{ height: "700px", width: "70%", margin: "auto" }}
      >
        <AgGridReact columnDefs={list} rowData={trainings}></AgGridReact>
      </div>
    </>
  );
}
