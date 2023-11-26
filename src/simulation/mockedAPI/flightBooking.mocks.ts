/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable require-jsdoc */
const validToken: string = 'FFsecret00token';
const validNames: string[] = [
  'ALWAY',
  'CHERNIKOV',
  'DINIZ',
  'ERCOLANI',
  'GAIDUSH',
  'HESAM',
  'MEHTA',
  'OSTWALD',
  "O'REILLY",
  "O'CONNOR",
  'PETROVICS',
  'RINDSLAND',
];
export function auth(bookingNumber: string, lastName: string) {
  if (bookingNumber.toUpperCase() === 'PARL0A' && validNames.includes(lastName.toUpperCase())) {
    return { authToken: validToken };
  } else {
    return { error: 'Authentication failed' };
  }
}
export function bookingInfo(bookingNumber: string, authToken: string) {
  if (bookingNumber === undefined) {
    return { error: 'You forgot to input a booking_number!' };
  }
  if (authToken === undefined) {
    return { error: 'You forgot to input a auth_token!' };
  }

  if (bookingNumber.toUpperCase() == 'PARL0A' && authToken == validToken)
    return {
      flightNumber: 'PA123',
      scheduledDeparture: '2023-11-12 11:00am',
      scheduledArrival: '2023-11-12 12:30am',
      departureCity: 'New York',
      arrivalCity: 'Boston',
      passangers: 3,
    };
  else {
    return { error: "Booking Number doesn't exist" };
  }
}
export function checkAvailability(bookingNumber: string, newDate: string, authToken: string) {
  if (bookingNumber === undefined) {
    return { error: 'You forgot to input a booking_number!' };
  }
  if (bookingNumber.toUpperCase() === 'PARL0A' && authToken === validToken)
    if (newDate == '2023-11-19')
      return [
        {
          flightNumber: 'PA222',
          scheduledDeparture: '2023-11-19 8:00am',
          scheduledArrival: '2023-11-19 9:30am',
          departureCity: 'New York',
          arrivalCity: 'Boston',
          passangers: 3,
        },
        {
          flightNumber: 'PA321',
          scheduledDeparture: '2023-11-19 5:30pm',
          scheduledArrival: '2023-11-19 7:00pm',
          departureCity: 'New York',
          arrivalCity: 'Boston',
          passangers: 3,
        },
      ];
    else if (newDate == '2024-04-01')
      return [
        {
          flightNumber: 'PA222',
          scheduledDeparture: '2024-04-01 8:00am',
          scheduledArrival: '2024-04-01 9:30am',
          departureCity: 'New York',
          arrivalCity: 'Boston',
          passangers: 3,
        },
        {
          flightNumber: 'PA333',
          scheduledDeparture: '2024-04-01 9:00am',
          scheduledArrival: '2024-04-01 10:35am',
          departureCity: 'New York',
          arrivalCity: 'Boston',
          passangers: 3,
        },
        {
          flightNumber: 'PA444',
          scheduledDeparture: '2024-04-01 4:00pm',
          scheduledArrival: '2024-04-01 5:35pm',
          departureCity: 'New York',
          arrivalCity: 'Boston',
          passangers: 3,
        },
        {
          flightNumber: 'PA321',
          scheduledDeparture: '2024-04-01 5:30pm',
          scheduledArrival: '2024-04-01 7:00pm',
          departureCity: 'New York',
          arrivalCity: 'Boston',
          passangers: 3,
        },
      ];

  return { error: 'No flights available' };
}
export function changeFlightDate(bookingNumber: string, newDate: string, authToken: string): any {
  if (bookingNumber === undefined) {
    return { error: 'You forgot to input a booking_number!' };
  }
  if (authToken === undefined) {
    return { error: 'You forgot to input a auth_token!' };
  }
  if (newDate === undefined) {
    return { error: 'You forgot to input a new_date!' };
  }

  if (
    bookingNumber.toUpperCase() === 'PARL0A' &&
    ['2023-11-19', '2024-04-01'].includes(newDate) &&
    authToken === validToken
  ) {
    return true;
  } else {
    return false;
  }
}
export function isValidEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return pattern.test(email);
}
export function sendBookingChangeEmail(
  email: string,
  bookingNumber: number,
  newDepartureDate: Date,
  newDepartureTime: Date,
  newFlightNumber: number,
) {
  if (isValidEmail(email)) {
    return { success: 'Email sent' };
  } else {
    return { error: 'Invalid email address' };
  }
}
