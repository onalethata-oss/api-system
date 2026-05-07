# Transactional SMS API Documentation

**Tylersoft-Eclectics Technologies**
Plot: 8842 Khama Crescent | Government Enclave, Gaborone | Private Bag BO 70 Gaborone, Botswana
Tel: +(267) 3951798 | Fax: +(267) 3951898 | Email: enquiries@tylersoft.net

---

## Purpose of the Document

This document is intended to be a guide to clients who want to send SMSs via the Tylersoft SMS API.

---

## Revision History

| Version | Author | Date | Description |
|---------|--------|------|-------------|
| 1.0 | Gaonyadiwe Gaboiphiwe | 18/10/2024 | Initial draft |

---

## Introduction

Tylersoft SMS API is a REST-based API which enables registered clients to connect and send SMS(s).

The request format and details are explained in the subsequent sections.

---

## Requirements to Connect

- Client should be registered on the payment gateway.
- API credentials for the API.

---

## Request Parameters (Fields)

| Parameter Name | Mandatory/Optional | Description |
|----------------|-------------------|-------------|
| `message` | M | The actual message to be sent. |
| `recipient` | M | The mobile number of the individual who is supposed to receive the SMS. It should include the country code. E.g. Botswana number should start with `267` followed by the subscriber's mobile number. |
| `clientId` | M | The registered identity of the client sending the request. |
| `username` | M | The registered username of the client sending the request. |
| `password` | M | The password of the client sending the request. |
| `TransactionId` | M | Unique transaction number. |

---

## Sample SMS Request

```json
{
  "message": "This is a test sms",
  "recipient": "26774769141",
  "clientId": "1",
  "username": "xxxx",
  "password": "xxxxxxx",
  "TransactionId": "72134"
}
```

---

## Sample Success Response

```json
{
  "Message": "SMS was sent Successfully!",
  "Responsecode": "00"
}
```

---

## Sample Fail Response

```json
{
  "Message": "SMS not sent!",
  "Responsecode": "99"
}
```

---

## Response Codes

| Responsecode | Type | Status |
|--------------|------|--------|
| `00` | String | Successful |
| `99` | String | Failed |
