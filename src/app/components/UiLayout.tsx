"use client";

import React from "react";
import Div100vh from "react-div-100vh";
import { Slide, ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

type UiLayoutProps = {
  children: React.ReactNode;
};

export default function UiLayout({ children }: UiLayoutProps) {
  return (
    <>
      <Div100vh>{children}</Div100vh>

      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Slide}
      />
    </>
  );
}
