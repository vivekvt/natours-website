/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe('pk_test_51H5FCMGTmZGEAj5NNqOHqd4XSP9vsopiRiSkWfJCD5yyM2kniuEUlehH9ZIHMzMy2gqM93tBRokN8OQLMJPRfGLF00jII2n972');

export const bookTour = async tourId => {
    try {
        // 1 Get checkout session from API
        const session = await axios(`http://localhost:4040/api/v1/bookings/checkout-session/${tourId}`);
        // 2 Create checkout form + charge creadit card
        console.log(session);
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }

}