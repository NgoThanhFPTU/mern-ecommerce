import { useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import SummaryApi from "../../common";
import Context from "../../context";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const { fetchUserAddToCart } = useContext(Context);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!orderId) return;

      try {
        const response = await fetch(SummaryApi.confirmPayment.url, {
          method: SummaryApi.confirmPayment.method,
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, status: "PAID" }),
        });

        const responseData = await response.json();

        if (responseData.success) {
          Swal.fire({
            title: "Payment Successful!",
            text: "Your order has been updated, and your cart has been cleared.",
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
          });

          fetchUserAddToCart();
          setTimeout(() => {
            navigate("/");
          }, 400);
        } else {
          Swal.fire({
            title: "Payment Failed!",
            text: responseData.message || "Something went wrong.",
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Payment confirmation failed. Please try again.",
          icon: "error",
        });
        console.error("Payment confirmation error:", error);
      }
    };

    confirmPayment();
  }, [orderId, navigate]);

  return null;
};

export default PaymentSuccess;
