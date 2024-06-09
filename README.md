# Bitespeed Project

## Overview

This is part of a hiring task for backend developer post at BiteSpeed.
[Deployed link](https://bitespeed-project-v46x.onrender.com)

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm)
- [MySQL](https://dev.mysql.com/downloads/mysql/)

## Installation

To get a local copy up and running, follow these simple steps:

### Clone the Repository

```sh
git clone https://github.com/rrahul32/bitespeed-project.git
cd bitespeed-project
```

### Install Dependencies

```sh
npm install
```

### Setup Environment Variables

Copy contents of `example.env` to `.env` file in the root directory and edit the variables values.

### Start the Server

```sh
npm run build
npm start
```

## API Endpoints

### Identify Contact

- **Endpoint**: `/identify`
- **Method**: `POST`
- **Description**: Identify a contact and resolve primary and secondary contact relationships.
- **Request Body**:

```json
{
  "email": "user@example.com",
  "phoneNumber": "1234567890"
}
```

- **Response**:

```json
{
    "contact": {
        "primaryContactId": 27,
        "emails": [
            "user@example.com"
        ],
        "phoneNumbers": [
            "1234567890"
        ],
        "secondaryContactIds": []
    }
}
```
