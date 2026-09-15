# AUTO 360 — Vehicle Service Management & Tracking Platform

A production-ready vehicle service management and customer tracking platform built for AUTO 360.

The platform helps manage customers, vehicles, service workflows, progress tracking, and customer-facing service status through a responsive web application.

## Features

- Customer and vehicle management
- Vehicle service tracking
- Custom service stages and progress
- Public customer tracking links
- Real-time updates
- Admin dashboard
- Arabic / English support
- RTL / LTR support
- Responsive design
- Secure Firebase authentication and Firestore rules

## Tech Stack

- React.js
- Vite
- JavaScript
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- CSS

## Architecture

The application follows a component-based React architecture with Firebase-powered backend services.

The system separates administrative functionality from customer-facing tracking while using Firestore Security Rules to control access to application data.

## Customer Tracking

Customers can track their vehicle service progress through a dedicated public tracking link without requiring an account.

The tracking experience provides information such as:

- Current service status
- Current service stage
- Progress percentage
- Service timeline
- Service updates

## Service Workflow

AUTO 360 supports customizable service workflows, allowing different vehicle services to have their own stages and progress configuration.

This provides flexibility for different operational workflows within the service center.

## Localization

The platform supports:

- English — LTR
- Arabic — RTL

The interface is responsive across desktop, tablet, and mobile devices.

## Security

The application uses Firebase Authentication and Firestore Security Rules to protect administrative functionality and application data.

Customer tracking is provided through controlled public tracking functionality.



## Deployment

The application is deployed using Firebase Hosting.

## Author

**Mohamed Hesham**

[LinkedIn](https://www.linkedin.com/in/mohamed-hesham-600794372) ·
[Portfolio](https://mohamedhesham1530.getportify.com)
