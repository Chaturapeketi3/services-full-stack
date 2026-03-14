# HouseMate Backend

## Setup Instructions

1.  **Create a Virtual Environment:**
    ```bash
    cd backend
    python -m venv venv
    ```

2.  **Activate the Virtual Environment:**
    *   **Windows:**
        ```cmd
        venv\Scripts\activate
        ```
    *   **Mac/Linux:**
        ```bash
        source venv/bin/activate
        ```

3.  **Install Requirements:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Database Configuration:**
    Ensure PostgreSQL is running locally with the credentials matching those in the `.env` file:
    `postgresql://postgres:3904@localhost:5432/housemate_db`
    
5.  **Run the Server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The application will be running at `http://127.0.0.1:8000`.
