--
-- PostgreSQL database dump
--

\restrict G7Tt20K3OynWAbQ0bZ7USxsjM40MaQNRPjjGmGtteStsNL3EQn8FiULY5hXuKWm

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: outpass_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.outpass_requests (
    id character varying(50) NOT NULL,
    student_id character varying(50) NOT NULL,
    student_name character varying(100) NOT NULL,
    department character varying(100),
    hostel_block character varying(50) NOT NULL,
    room_number character varying(20) NOT NULL,
    outpass_type character varying(30) NOT NULL,
    destination character varying(255) NOT NULL,
    reason text NOT NULL,
    departure_time timestamp with time zone NOT NULL,
    expected_return_time timestamp with time zone NOT NULL,
    parent_name character varying(100),
    parent_phone character varying(20) NOT NULL,
    parent_consent character varying(30) DEFAULT 'PENDING_CALL'::character varying,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    rejection_reason text,
    warden_remarks text,
    approved_by character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_return_after_departure CHECK ((expected_return_time > departure_time)),
    CONSTRAINT outpass_requests_outpass_type_check CHECK (((outpass_type)::text = ANY ((ARRAY['DAY_PASS'::character varying, 'WEEKEND_PASS'::character varying, 'EMERGENCY_PASS'::character varying, 'VACATION_PASS'::character varying])::text[]))),
    CONSTRAINT outpass_requests_parent_consent_check CHECK (((parent_consent)::text = ANY ((ARRAY['VERIFIED'::character varying, 'PENDING_CALL'::character varying, 'CONFIRMED_VIA_SMS'::character varying, 'NOT_REQUIRED'::character varying])::text[]))),
    CONSTRAINT outpass_requests_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'EXPIRED'::character varying, 'COMPLETED'::character varying])::text[])))
);


ALTER TABLE public.outpass_requests OWNER TO postgres;

--
-- Name: outpass_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.outpass_status_history (
    id integer NOT NULL,
    outpass_id character varying(50) NOT NULL,
    previous_status character varying(20) NOT NULL,
    new_status character varying(20) NOT NULL,
    changed_by character varying(50) NOT NULL,
    changed_by_role character varying(20) NOT NULL,
    changed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    remarks text,
    rejection_reason text,
    CONSTRAINT outpass_status_history_changed_by_role_check CHECK (((changed_by_role)::text = ANY ((ARRAY['STUDENT'::character varying, 'WARDEN'::character varying, 'ADMIN'::character varying])::text[]))),
    CONSTRAINT outpass_status_history_new_status_check CHECK (((new_status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'EXPIRED'::character varying, 'COMPLETED'::character varying])::text[])))
);


ALTER TABLE public.outpass_status_history OWNER TO postgres;

--
-- Name: outpass_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.outpass_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.outpass_status_history_id_seq OWNER TO postgres;

--
-- Name: outpass_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.outpass_status_history_id_seq OWNED BY public.outpass_status_history.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    role character varying(20) NOT NULL,
    hostel_block character varying(50),
    phone character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    password character varying(255) DEFAULT 'student123'::character varying NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['STUDENT'::character varying, 'WARDEN'::character varying, 'ADMIN'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: outpass_status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outpass_status_history ALTER COLUMN id SET DEFAULT nextval('public.outpass_status_history_id_seq'::regclass);


--
-- Data for Name: outpass_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.outpass_requests (id, student_id, student_name, department, hostel_block, room_number, outpass_type, destination, reason, departure_time, expected_return_time, parent_name, parent_phone, parent_consent, status, rejection_reason, warden_remarks, approved_by, created_at, updated_at) FROM stdin;
OP-2026-004	23AI015	Sneha Nair	AI & Data Science	Block B (Girls)	B-108	WEEKEND_PASS	Palakkad, Kerala (Hometown)	Sister engagement ceremony at native place.	2026-09-18 06:15:19.430746+05:30	2026-09-20 12:15:19.430746+05:30	S. Nair	+91 97861 23456	VERIFIED	PENDING	\N	\N	\N	2026-09-17 22:45:19.430746+05:30	2026-09-17 23:02:16.631323+05:30
OP-2026-001	23IT101	Keertheswar S	Information Technology	Block A (Boys)	A-304	WEEKEND_PASS	Trichy (Native Place)	Family function and weekend break.	2026-09-18 01:39:06.415507+05:30	2026-09-20 03:39:06.415507+05:30	Senthil Nathan	+91 94432 10987	CONFIRMED_VIA_SMS	PENDING	\N	\N	\N	2026-09-17 22:39:06.415507+05:30	2026-09-17 23:32:16.631323+05:30
OP-2026-003	22EC088	Arvind Kumar R	Electronics & Communication	Block A (Boys)	A-118	DAY_PASS	Electronics Market	Purchasing project sensors and components.	2026-09-18 02:39:06.415507+05:30	2026-09-18 07:39:06.415507+05:30	R. Radhakrishnan	+91 93456 78901	PENDING_CALL	PENDING	\N	\N	\N	2026-09-17 22:54:06.415507+05:30	2026-09-17 23:47:16.631323+05:30
OP-2026-007	24CS045	Karthik Raja P	Computer Science	Block A (Boys)	A-105	EMERGENCY_PASS	Eye Foundation Hospital, RS Puram	Eye irritation and urgent checkup.	2026-09-18 01:15:19.430746+05:30	2026-09-18 04:15:19.430746+05:30	P. Palanisamy	+91 94441 55667	VERIFIED	PENDING	\N	\N	\N	2026-09-17 23:55:19.430746+05:30	2026-09-18 00:12:16.631323+05:30
OP-2026-005	23ME034	Mohammed Faizal	Mechanical Engineering	Block C (Boys)	C-204	DAY_PASS	PSG Tech Campus (Hackathon)	Representing college at 24-hour CAD design challenge.	2026-09-18 04:15:19.430746+05:30	2026-09-19 04:15:19.430746+05:30	A. Abdul Faizal	+91 99441 23890	PENDING_CALL	PENDING	\N	\N	\N	2026-09-17 22:25:19.430746+05:30	2026-09-17 22:42:16.631323+05:30
OP-2026-009	23EE062	Sanjay V	Electrical & Electronics	Block C (Boys)	C-312	DAY_PASS	Local Power Substation / Industrial Visit	Field study for power systems project.	2026-09-17 22:15:19.430746+05:30	2026-09-18 04:15:19.430746+05:30	V. Velmurugan	+91 98411 77889	VERIFIED	APPROVED	\N	Permission granted for academic study.	WARDEN-001	2026-09-17 21:15:19.430746+05:30	2026-09-17 22:32:16.631323+05:30
OP-2026-002	23CS142	Priya Dharshini M	Computer Science and Engineering	Block B (Girls)	B-214	EMERGENCY_PASS	Apollo Clinic, Gandhipuram	Severe dental toothache, scheduled appointment.	2026-09-18 00:39:06.415507+05:30	2026-09-18 04:39:06.415507+05:30	Meenakshi Sundaram	+91 94876 54321	VERIFIED	PENDING	\N	\N	\N	2026-09-17 23:09:06.415507+05:30	2026-09-18 00:02:16.631323+05:30
OP-2026-006	22IT115	Deepa Lakshmi V	Information Technology	Block B (Girls)	B-305	DAY_PASS	Coimbatore Railway Station	Receiving family members arriving by Shatabdi train.	2026-09-17 20:15:19.430746+05:30	2026-09-18 04:15:19.430746+05:30	V. Vijayaraghavan	+91 94422 33445	VERIFIED	APPROVED	\N	Approved over phone. Return before 8:30 PM gate close.	WARDEN-002	2026-09-17 19:15:19.430746+05:30	2026-09-17 20:32:16.631323+05:30
OP-2026-008	23BT028	Ananya Ramesh	Biotechnology	Block D (Girls)	D-201	WEEKEND_PASS	Salem (Native Home)	Attending family festival celebration.	2026-09-18 05:15:19.430746+05:30	2026-09-20 02:15:19.430746+05:30	Ramesh K	+91 94433 88990	VERIFIED	PENDING	\N	\N	\N	2026-09-17 23:35:19.430746+05:30	2026-09-17 23:52:16.631323+05:30
OP-2026-010	24EC071	Kavitha S	Electronics & Communication	Block D (Girls)	D-115	DAY_PASS	Cross Cut Road Market	Purchasing books and hostel essentials.	2026-09-18 02:15:19.430746+05:30	2026-09-18 06:15:19.430746+05:30	S. Shanmugam	+91 98402 33445	PENDING_CALL	PENDING	\N	\N	\N	2026-09-18 00:00:19.430746+05:30	2026-09-18 00:17:16.631323+05:30
\.


--
-- Data for Name: outpass_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.outpass_status_history (id, outpass_id, previous_status, new_status, changed_by, changed_by_role, changed_at, remarks, rejection_reason) FROM stdin;
1	OP-2026-001	NONE	PENDING	23IT101	STUDENT	2026-09-17 22:39:06.415507+05:30	Initial outpass application submitted by student.	\N
2	OP-2026-002	NONE	PENDING	23CS142	STUDENT	2026-09-17 23:09:06.415507+05:30	Initial outpass application submitted by student.	\N
3	OP-2026-003	NONE	PENDING	22EC088	STUDENT	2026-09-17 22:54:06.415507+05:30	Initial outpass application submitted by student.	\N
10	OP-2026-001	NONE	PENDING	23IT101	STUDENT	2026-09-17 23:15:19.430746+05:30	Initial application submitted by student.	\N
11	OP-2026-002	NONE	PENDING	23CS142	STUDENT	2026-09-17 23:45:19.430746+05:30	Initial application submitted by student.	\N
12	OP-2026-003	NONE	PENDING	22EC088	STUDENT	2026-09-17 23:30:19.430746+05:30	Initial application submitted by student.	\N
13	OP-2026-004	NONE	PENDING	23AI015	STUDENT	2026-09-17 22:45:19.430746+05:30	Initial application submitted by student.	\N
14	OP-2026-005	NONE	PENDING	23ME034	STUDENT	2026-09-17 22:25:19.430746+05:30	Initial application submitted by student.	\N
15	OP-2026-006	NONE	PENDING	22IT115	STUDENT	2026-09-17 19:15:19.430746+05:30	Initial application submitted by student.	\N
16	OP-2026-006	PENDING	APPROVED	WARDEN-002	WARDEN	2026-09-17 20:15:19.430746+05:30	Approved over phone. Return before 8:30 PM.	\N
17	OP-2026-007	NONE	PENDING	24CS045	STUDENT	2026-09-17 23:55:19.430746+05:30	Initial emergency application submitted.	\N
18	OP-2026-008	NONE	PENDING	23BT028	STUDENT	2026-09-17 23:35:19.430746+05:30	Initial application submitted by student.	\N
19	OP-2026-009	NONE	PENDING	23EE062	STUDENT	2026-09-17 21:15:19.430746+05:30	Initial application submitted by student.	\N
20	OP-2026-009	PENDING	APPROVED	WARDEN-001	WARDEN	2026-09-17 22:15:19.430746+05:30	Permission granted for academic study.	\N
21	OP-2026-010	NONE	PENDING	24EC071	STUDENT	2026-09-18 00:00:19.430746+05:30	Initial application submitted by student.	\N
27	OP-2026-001	NONE	PENDING	23IT101	STUDENT	2026-09-17 23:20:02.817936+05:30	Initial application submitted by student.	\N
28	OP-2026-002	NONE	PENDING	23CS142	STUDENT	2026-09-17 23:50:02.817936+05:30	Initial application submitted by student.	\N
29	OP-2026-003	NONE	PENDING	22EC088	STUDENT	2026-09-17 23:35:02.817936+05:30	Initial application submitted by student.	\N
30	OP-2026-004	NONE	PENDING	23AI015	STUDENT	2026-09-17 22:50:02.817936+05:30	Initial application submitted by student.	\N
31	OP-2026-005	NONE	PENDING	23ME034	STUDENT	2026-09-17 22:30:02.817936+05:30	Initial application submitted by student.	\N
32	OP-2026-006	NONE	PENDING	22IT115	STUDENT	2026-09-17 19:20:02.817936+05:30	Initial application submitted by student.	\N
33	OP-2026-006	PENDING	APPROVED	WARDEN-002	WARDEN	2026-09-17 20:20:02.817936+05:30	Approved over phone. Return before 8:30 PM.	\N
34	OP-2026-007	NONE	PENDING	24CS045	STUDENT	2026-09-18 00:00:02.817936+05:30	Initial emergency application submitted.	\N
35	OP-2026-008	NONE	PENDING	23BT028	STUDENT	2026-09-17 23:40:02.817936+05:30	Initial application submitted by student.	\N
36	OP-2026-009	NONE	PENDING	23EE062	STUDENT	2026-09-17 21:20:02.817936+05:30	Initial application submitted by student.	\N
37	OP-2026-009	PENDING	APPROVED	WARDEN-001	WARDEN	2026-09-17 22:20:02.817936+05:30	Permission granted for academic study.	\N
38	OP-2026-010	NONE	PENDING	24EC071	STUDENT	2026-09-18 00:05:02.817936+05:30	Initial application submitted by student.	\N
44	OP-2026-001	NONE	PENDING	23IT101	STUDENT	2026-09-17 23:21:17.077121+05:30	Initial application submitted by student.	\N
45	OP-2026-002	NONE	PENDING	23CS142	STUDENT	2026-09-17 23:51:17.077121+05:30	Initial application submitted by student.	\N
46	OP-2026-003	NONE	PENDING	22EC088	STUDENT	2026-09-17 23:36:17.077121+05:30	Initial application submitted by student.	\N
47	OP-2026-004	NONE	PENDING	23AI015	STUDENT	2026-09-17 22:51:17.077121+05:30	Initial application submitted by student.	\N
48	OP-2026-005	NONE	PENDING	23ME034	STUDENT	2026-09-17 22:31:17.077121+05:30	Initial application submitted by student.	\N
49	OP-2026-006	NONE	PENDING	22IT115	STUDENT	2026-09-17 19:21:17.077121+05:30	Initial application submitted by student.	\N
50	OP-2026-006	PENDING	APPROVED	WARDEN-002	WARDEN	2026-09-17 20:21:17.077121+05:30	Approved over phone. Return before 8:30 PM.	\N
51	OP-2026-007	NONE	PENDING	24CS045	STUDENT	2026-09-18 00:01:17.077121+05:30	Initial emergency application submitted.	\N
52	OP-2026-008	NONE	PENDING	23BT028	STUDENT	2026-09-17 23:41:17.077121+05:30	Initial application submitted by student.	\N
53	OP-2026-009	NONE	PENDING	23EE062	STUDENT	2026-09-17 21:21:17.077121+05:30	Initial application submitted by student.	\N
54	OP-2026-009	PENDING	APPROVED	WARDEN-001	WARDEN	2026-09-17 22:21:17.077121+05:30	Permission granted for academic study.	\N
55	OP-2026-010	NONE	PENDING	24EC071	STUDENT	2026-09-18 00:06:17.077121+05:30	Initial application submitted by student.	\N
58	OP-2026-005	PENDING	APPROVED	WARDEN-001	WARDEN	2026-09-18 00:27:17.415513+05:30	Quick approve by warden.	\N
66	OP-2026-001	NONE	PENDING	23IT101	STUDENT	2026-09-17 23:32:16.631323+05:30	Initial application submitted by student.	\N
67	OP-2026-002	NONE	PENDING	23CS142	STUDENT	2026-09-18 00:02:16.631323+05:30	Initial application submitted by student.	\N
68	OP-2026-003	NONE	PENDING	22EC088	STUDENT	2026-09-17 23:47:16.631323+05:30	Initial application submitted by student.	\N
69	OP-2026-004	NONE	PENDING	23AI015	STUDENT	2026-09-17 23:02:16.631323+05:30	Initial application submitted by student.	\N
70	OP-2026-005	NONE	PENDING	23ME034	STUDENT	2026-09-17 22:42:16.631323+05:30	Initial application submitted by student.	\N
71	OP-2026-006	NONE	PENDING	22IT115	STUDENT	2026-09-17 19:32:16.631323+05:30	Initial application submitted by student.	\N
72	OP-2026-006	PENDING	APPROVED	WARDEN-002	WARDEN	2026-09-17 20:32:16.631323+05:30	Approved over phone. Return before 8:30 PM.	\N
73	OP-2026-007	NONE	PENDING	24CS045	STUDENT	2026-09-18 00:12:16.631323+05:30	Initial emergency application submitted.	\N
74	OP-2026-008	NONE	PENDING	23BT028	STUDENT	2026-09-17 23:52:16.631323+05:30	Initial application submitted by student.	\N
75	OP-2026-009	NONE	PENDING	23EE062	STUDENT	2026-09-17 21:32:16.631323+05:30	Initial application submitted by student.	\N
76	OP-2026-009	PENDING	APPROVED	WARDEN-001	WARDEN	2026-09-17 22:32:16.631323+05:30	Permission granted for academic study.	\N
77	OP-2026-010	NONE	PENDING	24EC071	STUDENT	2026-09-18 00:17:16.631323+05:30	Initial application submitted by student.	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, role, hostel_block, phone, created_at, password) FROM stdin;
WARDEN-001	Dr. R. Sundaram	warden.sundaram@college.edu	WARDEN	Block A & C (Boys)	+91 94432 00001	2026-09-17 23:39:06.415507+05:30	warden123
WARDEN-002	Dr. S. Meenakshi	warden.meenakshi@college.edu	WARDEN	Block B & D (Girls)	+91 94432 00002	2026-09-17 23:39:06.415507+05:30	warden123
23IT101	Keertheswar S	keertheswar@student.college.edu	STUDENT	Block A (Boys)	+91 98765 43210	2026-09-17 23:39:06.415507+05:30	student123
22EC088	Arvind Kumar R	arvind.ec@student.college.edu	STUDENT	Block A (Boys)	+91 91234 56780	2026-09-17 23:39:06.415507+05:30	student123
24CS045	Karthik Raja P	karthik.cs@student.college.edu	STUDENT	Block A (Boys)	+91 98401 23456	2026-09-18 00:15:19.430746+05:30	student123
23ME034	Mohammed Faizal	faizal.me@student.college.edu	STUDENT	Block C (Boys)	+91 96551 23478	2026-09-18 00:15:19.430746+05:30	student123
23EE062	Sanjay V	sanjay.ee@student.college.edu	STUDENT	Block C (Boys)	+91 99440 98765	2026-09-18 00:15:19.430746+05:30	student123
23CS142	Priya Dharshini M	priya.cs@student.college.edu	STUDENT	Block B (Girls)	+91 97890 12345	2026-09-17 23:39:06.415507+05:30	student123
23AI015	Sneha Nair	sneha.ai@student.college.edu	STUDENT	Block B (Girls)	+91 98945 61234	2026-09-18 00:15:19.430746+05:30	student123
22IT115	Deepa Lakshmi V	deepa.it@student.college.edu	STUDENT	Block B (Girls)	+91 98421 98765	2026-09-18 00:15:19.430746+05:30	student123
23BT028	Ananya Ramesh	ananya.bt@student.college.edu	STUDENT	Block D (Girls)	+91 97900 11223	2026-09-18 00:15:19.430746+05:30	student123
24EC071	Kavitha S	kavitha.ec@student.college.edu	STUDENT	Block D (Girls)	+91 94455 66778	2026-09-18 00:15:19.430746+05:30	student123
\.


--
-- Name: outpass_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.outpass_status_history_id_seq', 77, true);


--
-- Name: outpass_requests outpass_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outpass_requests
    ADD CONSTRAINT outpass_requests_pkey PRIMARY KEY (id);


--
-- Name: outpass_status_history outpass_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outpass_status_history
    ADD CONSTRAINT outpass_status_history_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_status_history_changed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_status_history_changed_at ON public.outpass_status_history USING btree (changed_at);


--
-- Name: idx_status_history_chronological; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_status_history_chronological ON public.outpass_status_history USING btree (outpass_id, changed_at);


--
-- Name: idx_status_history_outpass_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_status_history_outpass_id ON public.outpass_status_history USING btree (outpass_id);


--
-- Name: outpass_requests outpass_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outpass_requests
    ADD CONSTRAINT outpass_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: outpass_requests outpass_requests_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outpass_requests
    ADD CONSTRAINT outpass_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: outpass_status_history outpass_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outpass_status_history
    ADD CONSTRAINT outpass_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: outpass_status_history outpass_status_history_outpass_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.outpass_status_history
    ADD CONSTRAINT outpass_status_history_outpass_id_fkey FOREIGN KEY (outpass_id) REFERENCES public.outpass_requests(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict G7Tt20K3OynWAbQ0bZ7USxsjM40MaQNRPjjGmGtteStsNL3EQn8FiULY5hXuKWm

