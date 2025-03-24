import { FaUser, FaHistory, FaSpinner } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { FaRegCircleUser } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import SummaryApi from "../common";
import { setUserDetails } from "../store/userSlice";
import SweetAlert from "sweetalert";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../helpers/firebaseConfig";
import Swal from "sweetalert2";

export default function Profile() {
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState("account");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const validateInput = () => {
    const PHONE_REGEX = /^[0-9]{10,11}$/;
    const trimmedName = formData.name.trim().replace(/\s+/g, " ");
    const trimmedPhone = formData.phone.trim();
    setFormData({ name: trimmedName, phone: trimmedPhone });
    formData.name = trimmedName;
    formData.phone = trimmedPhone;

    if (trimmedName.length > 50) {
      Swal.fire(
        "Error!",
        `Name is too long! Maximum allowed is ${50} characters.`,
        "error"
      );
      setFormData({ name: trimmedName.substring(0, 50), phone: trimmedPhone });
      return false;
    }

    if (trimmedPhone.length > 11) {
      Swal.fire(
        "Error!",
        `Phone number is too long! Maximum allowed is ${11} characters.`,
        "error"
      );
      return false;
    }

    if (!PHONE_REGEX.test(trimmedPhone)) {
      Swal.fire(
        "Error!",
        "Invalid phone number! It should contain only numbers and be 10-11 digits long.",
        "error"
      );
      return false;
    }

    return true;
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const storageRef = ref(storage, `admin_avatars`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {},
      (error) => {
        console.error("Upload failed:", error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const fetchResponse = await fetch(SummaryApi.updateAvatar.url, {
            method: SummaryApi.updateAvatar.method,
            credentials: "include",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              userId: user._id,
              profilePic: downloadURL,
            }),
          });
          const responseData = await fetchResponse.json();
          if (responseData.success) {
            dispatch(setUserDetails({ ...user, profilePic: downloadURL }));
            setTimeout(() => {
              SweetAlert(
                "Updating avatar successfully!",
                "Your avatar has been updated.",
                "success"
              );
            }, 200);
          } else {
            console.error("Failed to update avatar:", responseData.message);
          }
        } catch (err) {
          console.error("Error getting download URL:", err);
        }
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    if (!validateInput()) return;
    try {
      const response = await fetch(SummaryApi.updateProfile.url, {
        method: SummaryApi.updateProfile.method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          name: formData.name.trim().replace(/\s+/g, " "),
          phone: formData.phone.trim(),
        }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        dispatch(setUserDetails({ ...user, ...formData }));
        setTimeout(() => {
          SweetAlert(
            "Update information success!",
            "Thông tin đã được cập nhật",
            "success"
          );
        }, 300);
        setEditing(false);
      } else {
        console.error("Error update:", responseData.message);
      }
    } catch (err) {
      console.error("Error update", err);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-1/4 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-700">Tài khoản</h2>
        <ul className="space-y-4">
          <li
            className={`flex items-center p-3 cursor-pointer rounded-lg transition duration-200 ${
              selectedTab === "account"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setSelectedTab("account")}
          >
            <FaUser className="mr-3" /> Quản lý tài khoản
          </li>
          <li
            className={`flex items-center p-3 cursor-pointer rounded-lg transition duration-200 ${
              selectedTab === "orders"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setSelectedTab("orders")}
          >
            <FaHistory className="mr-3" /> Lịch sử đơn hàng
          </li>
        </ul>
      </div>

      <div className="w-3/4 p-8">
        {selectedTab === "account" ? (
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Quản lý tài khoản
            </h1>

            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
              <div className="relative flex flex-col items-center mb-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="avatarInput"
                />
                <label
                  htmlFor="avatarInput"
                  className="cursor-pointer relative group"
                >
                  {user?.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      className="w-28 h-28 rounded-full shadow-md object-cover transition-opacity duration-300 group-hover:opacity-70"
                    />
                  ) : (
                    <FaRegCircleUser className="w-28 h-28 text-gray-400" />
                  )}
                  <span className="rounded-full absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Thay đổi ảnh
                  </span>
                </label>
              </div>

              {editing ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Tên đầy đủ"
                  />
                  <p className="text-gray-600 mb-2">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Số điện thoại"
                  />
                  <button
                    onClick={handleUpdateProfile}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all"
                  >
                    Lưu thay đổi
                  </button>
                </>
              ) : (
                <>
                  <p className="text-lg mb-2">
                    <strong className="text-gray-700">Tên:</strong> {user.name}
                  </p>
                  <p className="text-lg mb-2">
                    <strong className="text-gray-700">Email:</strong>{" "}
                    {user.email}
                  </p>
                  <p className="text-lg mb-4">
                    <strong className="text-gray-700">SĐT:</strong> {user.phone}
                  </p>
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg shadow-md hover:bg-gray-800 transition-all"
                  >
                    Chỉnh sửa
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          // (
          //   <div>
          //     <h1 className="text-2xl font-bold text-gray-800 mb-6">Lịch sử đơn hàng</h1>
          //     <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          //       {user.orders.length ? (
          //         user.orders.map((order, index) => (
          //           <div key={index} className="p-4 border-b last:border-b-0">
          //             <p><strong>Mã đơn:</strong> {order.id}</p>
          //             <p><strong>Tổng:</strong> ${order.total}</p>
          //             <p><strong>Ngày:</strong> {order.date}</p>
          //           </div>
          //         ))
          //       ) : (
          //         <p className="text-gray-500">Không có đơn hàng nào.</p>
          //       )}
          //     </div>
          //   </div>
          // )
          <></>
        )}
      </div>
    </div>
  );
}
