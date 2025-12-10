import React from "react";
import axios from "axios";
import { serverURL } from "../App.jsx";
import { useNavigate } from "react-router-dom";

function Razorpay() {
  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      // Step 0: Ensure Razorpay script is loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check your connection.");
        return;
      }

      // Step 1: Create order on the server
      const orderResponse = await axios.post(`${serverURL}/payments/create`, {
        amount: 50000, // INR
        currency: "INR",
      });

      const { amount, id: order_id, currency } = orderResponse.data.data;

      // Step 2: Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount,
        currency,
        name: "Event Flex",
        description: "Event Transaction",
        order_id,
        handler: async function (response) {
          try {
            // Step 3: Verify payment on the server
            await axios.post(`${serverURL}/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            alert("Payment successful and verified!");
            navigate("/success");
          } catch (verifyError) {
            console.error("Verification failed:", verifyError);
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: "Event Flex User",
          email: "team.aditya.invincible@gmail.com",
          contact: "9999999999",
        },
        theme: {
          color: "#F37254",
        },
      };

      // Step 4: Open Razorpay checkout
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error during payment:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div>
      <button onClick={handlePayment}>Pay with Razorpay</button>
    </div>
  );
}

export default Razorpay;