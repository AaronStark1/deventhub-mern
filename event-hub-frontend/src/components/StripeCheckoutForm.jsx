import {
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";

export default function StripeCheckoutForm({ clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const { error, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

    if (error) {
      alert(error.message);
    } else if (paymentIntent.status === "succeeded") {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement />
      </div>

      <button
        type="submit"
        disabled={!stripe}
        className="w-full py-3 bg-primary text-white rounded-lg"
      >
        Pay Now
      </button>
    </form>
  );
}
