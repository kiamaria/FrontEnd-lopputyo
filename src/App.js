import './App.css';
import React,  { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';

import Customerlist from './components/Customerlist';
import Traininglist from './components/Trainingslist';

function App() {
  const [view, setView] = useState('customerList')

  const handleShowView = () => {
    switch(view) {
      case 'customerList':
        return <Customerlist />
        break
      case 'trainingList':
        return <Traininglist />
        break
      default:
        return <Customerlist />
    }
  }

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Personal Trainer!</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={() => { setView('trainingList')}}>Trainings</Nav.Link>
            <Nav.Link onClick={() => { setView('customerList')}}>Customers</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    <Row>
      { handleShowView() }
    </Row>
    </>
  );

}

export default App;
