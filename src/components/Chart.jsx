import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip } from "recharts";

export default function CreateChart() {
  const [trainingDurations, setTrainingDurations] = useState([]);

  useEffect(() => {
    getCalendarEvents();
  }, []);

  const getCalendarEvents = async () => {
    try {
      let trainings = await fetch(
        "https://traineeapp.azurewebsites.net/api/trainings"
      );

      let trainingData = await trainings.json();

      let durationsMap = {};
      for (let i = 0; i < trainingData.content.length; i++) {
        let training = trainingData.content[i];
        const activity = training.activity;
        const duration = training.duration;

        if (durationsMap[activity]) {
          durationsMap[activity] += duration;
        } else {
          durationsMap[activity] = duration;
        }
      }

      let chartData = Object.keys(durationsMap).map(activity => ({
        name: activity,
        totalDuration: durationsMap[activity],
      }));

      setTrainingDurations(chartData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <BarChart
        width={1000}
        height={700}
        data={trainingDurations}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <XAxis dataKey="name" />
        <Tooltip />
        <CartesianGrid stroke="#f5f5f5" />
        <Bar dataKey="totalDuration" fill="blue" />
      </BarChart>
      <p>Duration (min)</p>
    </div>
  );
  
};


