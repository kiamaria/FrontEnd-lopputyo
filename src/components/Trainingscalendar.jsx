import React, { useEffect, useState } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function CreateCalendar() {
  const [trainingEvents, setTrainingEvents] = useState([]);

  useEffect(() => {
    getCalendarEvents();
  }, []);

  const getCalendarEvents = async () => {
    try {
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

      let trainingsEvents = [];

      for (let i = 0; i < trainingWithCustomers.length; i++) {
        let event = {
          title: trainingWithCustomers[i].activity + " / " + trainingWithCustomers[i].customerName,
          start: new Date(trainingWithCustomers[i].date),
          end: moment(trainingWithCustomers[i].date)
            .add(trainingWithCustomers[i].duration, 'minutes')
            .toDate(),
        };
        trainingsEvents.push(event);
      }

      setTrainingEvents(trainingsEvents); 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        events={trainingEvents} 
      />
    </div>
  );
}

