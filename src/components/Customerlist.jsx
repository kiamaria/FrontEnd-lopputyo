import React, { useState, useEffect, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-material.css";
import "ag-grid-community/styles/ag-grid.css";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { Input } from "@mui/base/Input";

export default function Customerlist() {
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [modify, setModify] = useState();
  const [customerId, setCustomerId] = useState();

  useEffect(() => {fetchCustomers()}, []);

  const gridRef = useRef();

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

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

  const fetchCustomers = async () => {
    fetch("https://traineeapp.azurewebsites.net/api/customers")
      .then((response) => response.json())
      .then((data) => {
        console.log(data.content);
        setCustomers(data.content);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const addNew = async () => {
    if (!firstName && !lastName) {
      return;
    }

    let data = {
      firstname: firstName,
      lastname: lastName,
    };

    try {
      await fetch("https://traineeapp.azurewebsites.net/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.log(error);
    } finally {
      fetchCustomers();
      handleClose();
      resetModal();
    }
  };

  const startUpdateCustomer = async (customer) => {
    console.log(customer);

    setModify(true);

    setFirstName(customer.firstname);
    setLastName(customer.lastname);
    setCustomerId(
      customer.links
        .find((link) => link.rel === "customer")
        .href.replace("http:", "https:")
    );

    handleOpen();
  };

  const updateCustomer = async () => {
    let data = {
      firstname: firstName,
      lastname: lastName,
    };

    try {
      await fetch(customerId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.log(error);
    } finally {
      setModify(false);
      fetchCustomers();
      handleClose();
      resetModal();
    }
  };

  const resetModal = async () => {
    setFirstName();
    setCustomerId();
    setLastName();
    handleClose();
  };

  const handleAdd = async () => {
    setModify(false);

    handleOpen();
  };

  const onDelClick = async (customer) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );
    if (confirmed) {
      try {
        await fetch(
          customer.links
            .find((i) => i.rel === "self")
            .href.replace("http:", "https:"),
          {
            method: "DELETE",
          }
        );

        fetchCustomers();
      } catch (error) {
        console.error("Error deleting training:", error);
      }
    }
  };

  const onBtnExport = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      const params = {
        processCellCallback: ({ value, column }) => {
          return value;
        },
        processHeaderCallback: ({ column }) => {
          return column.getColDef().field;
        },
        columnKeys: list
          .filter(
            (col) => col.field !== "Update" && col.headerName !== "Delete"
          )
          .map((col) => col.field),
        columnSeparator: ";"
      };
      gridRef.current.api.exportDataAsCsv(params);
    } else {
      console.error("Grid reference or API not available yet");
    }
  }, []);

  const list = [
    {
      field: "firstname",
      sortable: true,
      filter: true,
    },
    {
      field: "lastname",
      sortable: true,
      filter: true,
    },
    {
      field: "Update",
      sortable: false,
      filter: false,
      cellRenderer: (row) => {
        return (
          <Button onClick={() => startUpdateCustomer(row.data)}>Update</Button>
        );
      },
    },
    {
      field: "",
      headerName: "Delete",
      sortable: false,
      filterable: false,
      flex: 1,
      cellRenderer: (row) => {
        return <Button onClick={() => onDelClick(row.data)}>Delete</Button>;
      },
    },
  ];

  return (
    <>
      <div
        className="ag-theme-material"
        style={{ height: "700px", width: "70%", margin: "auto" }}
      >
        <h1>Customers 👥</h1>
        <Button onClick={handleAdd}>Add</Button>
        <Button onClick={onBtnExport}>Export CSV</Button>
        <AgGridReact
          rowHeight={30}
          columnDefs={list}
          rowData={customers}
          ref={gridRef}
        ></AgGridReact>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Input
              placeholder="Firstname"
              label="Required"
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
            />
            <Input
              placeholder="Lastname"
              label="Required"
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
            />
            <Button onClick={resetModal}>Cancel</Button>
            <Button onClick={modify ? updateCustomer : addNew}>Save</Button>
            
          </Box>
        </Modal>
      </div>
    </>
  );
}
