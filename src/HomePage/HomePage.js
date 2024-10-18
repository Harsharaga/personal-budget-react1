import React, { useEffect, useRef, useCallback } from 'react';
import Chart from 'chart.js/auto'; 
import * as d3 from 'd3'; 
import './HomePage.scss'; 
import budgetData from './budget.json'; 
import axios from 'axios';

function HomePage() {
  const chartRef = useRef(null); 
  const d3ChartRef = useRef(null);


  const fetchDataAndInitializeD3 = useCallback(async () => {
    try {
      const response = await axios.get('/data/savings.json'); 
      const d3Data = response.data.mySavings; 

      if (Array.isArray(d3Data)) {
        initializeD3PieChart(d3Data); 
      } else {
        console.error('Data fetched is not an array', d3Data);
      }
    } catch (error) {
      console.error('Error fetching D3 data:', error);
    }
  }, []);

  useEffect(() => {
    initializeChart(budgetData.myBudget); 
    fetchDataAndInitializeD3(); 

    const chartRefValue = chartRef.current;
    const d3ChartRefValue = d3ChartRef.current;

    return () => {
      if (chartRefValue) {
        chartRefValue.destroy();
      }
      if (d3ChartRefValue) {
        d3.select(d3ChartRefValue).selectAll('*').remove();
      }
    };
  }, [fetchDataAndInitializeD3]);

  const initializeChart = (data) => {
    const labels = data.map(item => item.title);   
    const values = data.map(item => item.budget);  
    const ctx = document.getElementById('myChart').getContext('2d');

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: 'pie', 
      data: {
        labels: labels, 
        datasets: [{
          label: 'Budget',
          data: values,  
          backgroundColor: [
            '#ffcd56',
            '#ff6384',
            '#36a2eb',
            '#fd6b19',
            '#FFFF00',
            '#00FF00',
            '#00FFFF'
          ],
          borderColor: [
            '#ffcd56',
            '#ff6384',
            '#36a2eb',
            '#fd6b19',
            '#FFFF00',
            '#00FF00',
            '#00FFFF'
          ],
          borderWidth: 1
        }]
      },
    });
  };

  const initializeD3PieChart = (data) => {
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    d3.select(d3ChartRef.current).selectAll('*').remove();

    const svg = d3.select(d3ChartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.title))
      .range(['#ffcd56', '#ff6384', '#36a2eb', '#fd6b19', '#FFFF00', '#00FF00', '#00FFFF']);

    const pie = d3.pie()
      .value(d => d.budget) 
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = svg.selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.title));

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .text(d => d.data.title)
      .style('font-size', '12px')
      .style('fill', '#fff');
  };

  return (
    <main className="center" id="main">
      <div className="page-area">
        <article>
          <h1>Stay on track</h1>
          <p>
            Do you know where you are spending your money? If you really stop to track it down,
            you would get surprised! Proper budget management depends on real data... and this
            app will help you with that!
          </p>
        </article>

        <article>
          <h1>Alerts</h1>
          <p>
            What if your clothing budget ended? You will get an alert. The goal is to never go over the budget.
          </p>
        </article>

        <article>
          <h1>Results</h1>
          <p>
            People who stick to a financial plan, budgeting every expense, get out of debt faster!
            Also, they tend to live happier lives... since they spend without guilt or fear...
            because they know it is all good and accounted for.
          </p>
        </article>

        <article>
          <h1>Free</h1>
          <p>
            This app is free!!! And you are the only one holding your data!
          </p>
        </article>

        <article>
          <h1>Chart</h1>
          <div>
            <canvas id="myChart" width="400" height="400"></canvas>
            <div id="d3-chart" ref={d3ChartRef}></div>
          </div>
        </article>
      </div>
    </main>
  );
}

export default HomePage;
