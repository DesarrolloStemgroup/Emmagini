// @ts-nocheck

"use client";

import React, { createContext } from "react";

import axios from "axios";
import { useState, useContext, useEffect, useCallback } from "react";

const TOKEN_KEY = "token";
const USER_ID_KEY = "user_id";

interface AuthContextValues {
	userId: string;
	token: string;
	lang: string;
	setLang: (lang: string) => void;
	signInWithEmailAndPassword: (
		email: string,
		password: string
	) => Promise<void>;

	singUpNewUser: (
		userName: string,
		email: string,
		password: string,
		confirmPassword: string
	) => Promise<void>;

	signInWithGoogle: (credential: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValues>({} as any);

export const AuthProvider = ({ children }) => {
	const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;

	const [userId, setUserId] = useState("");
	const [token, setToken] = useState("");
	const [lang, setLang] = useState("es");

	const singUpNewUser = useCallback(
		async (
			username: string,
			email: string,
			password: string,
			confirmPassword: string
		) => {
			try {
				const response = await axios.post(
					"https://backend.emmagini.com/api2/registrar",
					{
						username: email,
						fullname: username,
						password: password,
						repassword: confirmPassword,
						lang: lang,
						host: HOST_URL,
						timezone: -3,
						fcm_token: "",
					},
					{
						headers: {
							"Content-Type":
								"application/x-www-form-urlencoded; charset=UTF-8",
						},
					}
				);

				return response.data;
			} catch (error) {
				console.error("Error al hacer la solicitud:", error);
				throw error;
			}
		},
		[]
	);

	const signInWithEmailAndPassword = useCallback(
		async (email: string, password: string) => {
			try {
				const response = await axios.post(
					"https://backend.emmagini.com/api2/gettoken",
					{
						username: email,
						password: password,
						timezone: -3,
						fcm_token: "",
						id_plataforma: 3,
						lang: lang,
						host: HOST_URL,
					},
					{
						headers: {
							"Content-Type":
								"application/x-www-form-urlencoded; charset=UTF-8",
						},
					}
				);

				const { token, userid } = response.data;

				localStorage.setItem(TOKEN_KEY, token);
				localStorage.setItem(USER_ID_KEY, userid);

				setToken(token);
				setUserId(userid);

				return response.data;
			} catch (error) {
				console.error("Error al hacer la solicitud:", error);
				throw error;
			}
		},
		[]
	);

	useEffect(() => {
		const getCacheData = () => {
			const cachedToken = localStorage.getItem(TOKEN_KEY);
			const cachedUserId = localStorage.getItem(USER_ID_KEY);
			if (cachedToken && cachedUserId) {
				setToken(cachedToken);
				setUserId(cachedUserId);
			}
		};

		getCacheData();
	}, []);

	const signInWithGoogle = useCallback(async (credential: string) => {
		try {
			const response = await axios.post(
				"https://backend.emmagini.com/api2/google_login",
				{
					host: HOST_URL,
					client_id:
						"861018734768-mm2f76o6bidnoplpck3i87vdm91vrbut.apps.googleusercontent.com",
					credential: credential,
					fcm_token: "",
					es_app: 0,
					id_plataforma: 3,
					lang: lang,
					timezone: -3,
				},
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
					},
				}
			);

			return response.data;
		} catch (error) {
			console.error("Error al hacer la solicitud:", error);
			throw error;
		}
	}, []);

	return (
		<AuthContext.Provider
			value={{
				userId,
				token,
				setToken,
				setUserId,
				signInWithEmailAndPassword,
				singUpNewUser,
				signInWithGoogle,
				lang,
				setLang,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuthContext = () => useContext(AuthContext);
