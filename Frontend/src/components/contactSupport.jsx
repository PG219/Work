import React, { useState } from "react";
import axios from "axios";
import SendIcon from "@mui/icons-material/Send";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { getBackendUrl } from "@/config/env";

const YOUR_BACKEND_API_URL = getBackendUrl("/contact");

export default function ContactSupport() {
  const [formStatus, setFormStatus] = useState("");
  const [formError, setFormError] = useState("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("sending");
    setFormError("");

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      inquiryType: e.target["inquiry-type"].value,
      message: e.target.message.value,
    };

    try {
      await axios.post(YOUR_BACKEND_API_URL, formData);

      setFormStatus("success");
      e.target.reset();
      setTimeout(() => setFormStatus(""), 3000);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to send message.";
      setFormError(message);
      setFormStatus("error");
      setTimeout(() => setFormStatus(""), 5000);
    }
  };

  const inputClasses =
    "w-full p-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-950 transition-colors";

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-1">
        <MailOutlineIcon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        <h2 className="text-2xl font-bold">Contact Support</h2>
      </div>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Can't find an answer? Let us know.
      </p>

      <form onSubmit={handleFormSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Full Name
            </label>
            <input id="name" type="text" required className={inputClasses} />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Email Address
            </label>
            <input id="email" type="email" required className={inputClasses} />
          </div>

          <div>
            <label
              htmlFor="inquiry-type"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Inquiry Type
            </label>
            <select id="inquiry-type" className={inputClasses}>
              <option>General Question</option>
              <option>Technical Issue</option>
              <option>Billing Inquiry</option>
              <option>Feature Request</option>
              <option>Urgent</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Message
            </label>
            <textarea
              id="message"
              rows="5"
              required
              className={`${inputClasses} min-h-[100px]`}
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={formStatus === "sending"}
          >
            <SendIcon className="w-5 h-5" />
            <span>{formStatus === "sending" ? "Sending..." : "Send Message"}</span>
          </button>

          {formStatus === "success" && (
            <p className="text-center text-sm text-green-600 dark:text-green-400 mt-4">
              Message sent! We'll be in touch shortly.
            </p>
          )}

          {formStatus === "error" && (
            <p className="text-center text-sm text-red-600 dark:text-red-400 mt-4">
              {formError || "An unknown error occurred."}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
