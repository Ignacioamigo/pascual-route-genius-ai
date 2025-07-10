# Capstone Project: Pascual Route Genius AI

This repository contains the final project for the IE Capstone project, which consists of two main components:

1.  **An optimization model** developed to analyze and improve the efficiency of promoter visits to clients.
2.  **A web application** that provides an interface to interact with the model's outputs and recommendations.

## Table of Contents

*   [Project Overview](#project-overview)
*   [Project Structure](#project-structure)
*   [1. Optimization Model](#1-optimization-model)
    *   [Notebooks](#notebooks)
    *   [Getting Started with the Model](#getting-started-with-the-model)
        *   [Prerequisites](#prerequisites)
        *   [Installation](#installation)
        *   [Running the Notebooks](#running-the-notebooks)
*   [2. Web Application](#2-web-application)
    *   [Getting Started with the Web App](#getting-started-with-the-web-app)
    *   [Technologies Used](#technologies-used)
    *   [Deployment](#deployment)
*   [Data Setup](#data-setup)
*   [Data](#data)
*   [Key Findings from the Model](#key-findings-from-the-model)
*   [Final Strategy and Impact](#final-strategy-and-impact)
*   [Contributing](#contributing)
*   [License](#license)

## Project Overview

The core objective of this project is to classify clients into different segments based on their value (ticket size) and the efficiency of promoter interactions. The project identifies "High-Ticket Inefficient" and "Low-Ticket Inefficient" clients as primary targets for optimization. By analyzing the patterns of efficient clients, the project aims to provide actionable recommendations for the number of promoter visits for inefficient clients, ultimately optimizing resource allocation and improving profitability.

---

## Project Structure

```
pascual-route-genius-ai/
├───pascual_optimization_model/
│   ├───data/
│   │   ├───raw/
│   │   │   └───Orders_Master_Data(in).xlsx  <-- Place raw data file here
│   │   └───processed/
│   │       ├───orders_raw.csv
│   │       ├───orders.csv
│   │       ├───clients.csv
│   │       └───clients_monthly.csv
│   │   └───results/
│   │       ├───all_ineff_optimized.csv.csv
│   │       ├───df_optimized_final.csv
│   │       ├───hv_ineff_optimized.csv
│   │       └───lv_ineff_optimized.csv
│   ├───scripts/
│   │   ├───preprocessing.ipynb
│   │   ├───eda_analysis.ipynb
│   │   ├───preliminary_xgboost.ipynb
│   │   ├───model_pyomo.ipynb
│   │   ├───model_kmeans.ipynb
│   │   └───model_final_strategy.ipynb
│   └───environment.yml
├───src/
│   ├───App.tsx
│   ├───server.ts
│   └───components/
├───package.json
├───vite.config.ts
└───README.md
```

---

## 1. Optimization Model

This component analyzes client data to identify and address inefficiencies in promoter visits.

### Notebooks

The project is structured across several Jupyter notebooks located in the `pascual_optimization_model/scripts/` directory:

*   **`preprocessing.ipynb`**: Handles the initial data loading, cleaning, and feature engineering.
*   **`eda_analysis.ipynb`**: (Placeholder) For exploratory data analysis.
*   **`preliminary_xgboost.ipynb`**: Develops a predictive model to determine the optimal number of promoter visits for inefficient clients.
*   **`model_pyomo.ipynb`**: Focuses on an optimization model to determine the optimal number of visits, considering cost and efficiency targets.
*   **`model_kmeans.ipynb`**: Provides a descriptive and diagnostic analysis of client segments and their characteristics.
*   **`model_final_strategy.ipynb`**: Develops and validates the final strategy for optimizing promoter visit frequencies, incorporating engineered optimization variables, target visit-order gaps, and rule-based visit reductions. It also leverages K-Means clustering to identify homogeneous subgroups within inefficient client segments for tailored recommendations.


### Getting Started with the Model

#### Prerequisites

*   Python 3.x
*   Conda

#### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Ignacioamigo/pascual-route-genius-ai.git
    cd pascual-route-genius-ai
    ```

2.  **Place the raw data file** `Orders_Master_Data(in).xlsx` into the `pascual_optimization_model/data/raw/` directory. The scripts are configured to read the input file from this location.

3.  **Create and activate the Conda environment:**
    ```bash
    cd pascual_optimization_model
    conda env create -f environment.yml
    conda activate capstone-project
    ```

4.  **Install a solver for the optimization model (optional, for `model_pyomo.ipynb`):**
    The optimization notebook uses the CBC solver.
    ```bash
    # On macOS with Homebrew
    brew install cbc
    ```

### Running the Notebooks

1.  **Start Jupyter Lab or Jupyter Notebook:**
    ```bash
    jupyter lab
    ```
2.  Navigate to the `pascual_optimization_model/scripts` directory and run the notebooks in the following order to replicate the results:
    1.  `preprocessing.ipynb`
    2.  `eda_analysis.ipynb` (or your equivalent EDA script)
    3.  `preliminary_xgboost.ipynb`
    4.  `model_kmeans.ipynb`
    5.  `model_pyomo.ipynb`
    6.  `model_final_strategy.ipynb`
---

## 2. Web Application

The web application, built with Lovable, provides a user-friendly interface to visualize the results of the optimization model and manage client data.

### Getting Started with the Web App

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Navigate to the project directory (if you are not already there).
cd pascual-route-genius-ai

# Step 2: Install the necessary dependencies.
npm i

# Step 3: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Technologies Used

This project is built with:

*   Vite
*   TypeScript
*   React
*   shadcn-ui
*   Tailwind CSS

### Deployment

This project can be deployed via Lovable by visiting the [Lovable Project](https://lovable.dev/projects/0623b0a5-2230-4646-8fe9-79a717ce5808) and clicking on Share -> Publish. You can also connect a custom domain through the project settings.

---

## Data Setup

Before running any of the notebooks, you must set up the raw data directory:

1.  Create a directory named `raw` inside the `pascual_optimization_model/data/` directory.
2.  Place the raw data file, `Orders_Master_Data(in).xlsx`, into the `pascual_optimization_model/data/raw/` directory.

## Data

*   **Raw Data:** The raw data file, `Orders_Master_Data(in).xlsx`, must be placed in the `pascual_optimization_model/data/raw/` directory.
*   **Processed Data:** The `pascual_optimization_model/data/processed` directory contains the cleaned and transformed datasets generated by the `preprocessing.ipynb` notebook.

## Key Findings from the Model

*   **Client Segmentation:** Clients are segmented into four categories based on their median ticket and efficiency: High-Ticket Efficient, Low-Ticket Efficient, High-Ticket Inefficient, and Low-Ticket Inefficient.
*   **Inefficiency Drivers:** The analysis suggests that inefficiency is primarily behavioral (too many visits for the number of orders) and not directly driven by the client's profit size.
*   **Optimization Models:** Both a predictive model (XGBoost) and a prescriptive optimization model (Pyomo with CBC solver) are used to recommend optimal visit frequencies for inefficient clients.
*   **Potential Savings:** The optimization models project significant potential cost savings by adjusting promoter visit schedules.

## Final Strategy and Impact

The final strategy for optimizing promoter visit frequencies focuses on developing and validating a robust approach to simulate cost-efficient corrective actions within the inefficient client segments. This involves:

*   **Engineered Optimization Variables:** Creating variables to estimate the financial and operational impact of reducing excess promoter visits, tailored to each inefficient quadrant (High-Ticket Inefficient and Low-Ticket Inefficient) and adjusted by behavioral cluster.
*   **Target Visit-Order Gap:** Assigning a target visit-order gap to each cluster, reflecting the acceptable inefficiency and room for optimization.
*   **Rule-Based Visit Reduction:** Converting the gap reduction into an integer number of visits to remove per month, with a soft rounding approach.
*   **Profit Margin Segmentation:** Further enriching segmentation by computing a profit margin metric for each client (ratio of total profit to total cost) to distinguish low-margin and high-margin groups.
*   **K-Means Clustering for Subgroups:** Applying K-Means clustering to identify more homogeneous subgroups within the inefficient quadrants, allowing for tailored recommendations.

This approach balances cost reduction goals with Pascual’s commitment to service quality, ensuring recommendations are both data-driven and operationally viable.

**Key Outcomes:**

*   **Significant Potential Savings:** The optimization models project substantial potential cost savings by adjusting promoter visit schedules.
*   **Targeted Intervention:** A Pareto-driven approach is recommended, focusing on the top 25–35% of clients responsible for the majority of excess cost. This allows for substantial efficiency gains with minimal operational disruption.
*   **Client Segmentation:** Clients are segmented into four categories based on their median ticket and efficiency: High-Ticket Efficient, Low-Ticket Efficient, High-Ticket Inefficient, and Low-Ticket Inefficient.
*   **Inefficiency Drivers:** Inefficiency is primarily behavioral (too many visits for the number of orders) and not directly driven by the client's profit size.
*   **LLM-based Decision Support:** The analysis is designed to integrate seamlessly with a dedicated Large Language Model (LLM) based decision support assistant, providing explainable, client-level recommendations to commercial teams.

This structured approach ensures that operational changes are proportionate and justified by client-level data, leading to a more efficient and profitable sales network.


Please feel free to submit pull requests or open issues to improve the project.

## License

This project is licensed under the MIT License.