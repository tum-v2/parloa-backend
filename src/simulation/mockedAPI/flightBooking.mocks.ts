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
/**
 * Authenticates a booking based on booking number and last name.
 * @param bookingNumber - The booking number to be authenticated.
 * @param lastName - The last name associated with the booking.
 * @returns An object with authToken if authentication is successful, otherwise an error message.
 */
export function auth(bookingNumber: string, lastName: string) {
  if (bookingNumber.toUpperCase() === 'PARL0A' && validNames.includes(lastName.toUpperCase())) {
    return { authToken: validToken };
  } else {
    return { error: 'Authentication failed' };
  }
}
/**
 * Retrieves booking information for a given booking number and authentication token.
 * @param bookingNumber - The booking number for which information is requested.
 * @param authToken - The authentication token to validate access.
 * @returns Booking details if successful, otherwise an error message.
 */
export function bookingInfo(bookingNumber: string, authToken: string) {
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
/**
 * Checks availability of flights for a new date.
 * @param bookingNumber - The booking number to check availability for.
 * @param newDate - The new date to check availability.
 * @param authToken - The authentication token to validate access.
 * @returns An array of available flights for the new date, or an error message if no flights are available.
 */
export function checkAvailability(bookingNumber: string, newDate: string, authToken: string) {
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
/**
 * Changes the flight date for a given booking.
 * @param bookingNumber - The booking number to change the flight date for.
 * @param newDate - The new date for the flight.
 * @param authToken - The authentication token to validate the change.
 * @returns A boolean indicating whether the flight date change was successful.
 */
export function changeFlightDate(bookingNumber: string, newDate: string, authToken: string): any {
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
/**
 * Validates an email address format.
 * @param email - The email address to validate.
 * @returns True if the email address is valid, otherwise false.
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return pattern.test(email);
}
/**
 * Sends an email regarding a booking change.
 * @param email - The recipient's email address.
 * @param bookingNumber - The booking number associated with the change.
 * @param newDepartureDate - The new departure date.
 * @param newDepartureTime - The new departure time.
 * @param newFlightNumber - The new flight number.
 * @returns An object indicating success or failure of the email sending.
 */
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
/**
 * Retrieves a list of all flights.
 * @returns An array of flight objects.
 */
export function getAllFlights() {
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
}
