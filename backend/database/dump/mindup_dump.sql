--
-- PostgreSQL database dump
--

\restrict eFakI2vfNG1WnrVjornciDFl27tzRfnm9OpZbf7bPQmXGacH2oGML9u3tAQa5h4

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Name: anotacoes; Type: TABLE; Schema: public; Owner: LaravelDockerImagem
--

CREATE TABLE public.anotacoes (
    id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    titulo character varying(100) NOT NULL,
    texto text NOT NULL,
    data_criacao timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.anotacoes OWNER TO "LaravelDockerImagem";

--
-- Name: anotacoes_id_seq; Type: SEQUENCE; Schema: public; Owner: LaravelDockerImagem
--

CREATE SEQUENCE public.anotacoes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.anotacoes_id_seq OWNER TO "LaravelDockerImagem";

--
-- Name: anotacoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: LaravelDockerImagem
--

ALTER SEQUENCE public.anotacoes_id_seq OWNED BY public.anotacoes.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: LaravelDockerImagem
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO "LaravelDockerImagem";

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: LaravelDockerImagem
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO "LaravelDockerImagem";

--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: LaravelDockerImagem
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO "LaravelDockerImagem";

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: LaravelDockerImagem
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO "LaravelDockerImagem";

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: LaravelDockerImagem
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: LaravelDockerImagem
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO "LaravelDockerImagem";

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: LaravelDockerImagem
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO "LaravelDockerImagem";

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: LaravelDockerImagem
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO "LaravelDockerImagem";

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: LaravelDockerImagem
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: LaravelDockerImagem
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO "LaravelDockerImagem";

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: LaravelDockerImagem
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO "LaravelDockerImagem";

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: LaravelDockerImagem
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: LaravelDockerImagem
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO "LaravelDockerImagem";

--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: LaravelDockerImagem
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO "LaravelDockerImagem";

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: LaravelDockerImagem
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO "LaravelDockerImagem";

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: LaravelDockerImagem
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: LaravelDockerImagem
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO "LaravelDockerImagem";

--
-- Name: users; Type: TABLE; Schema: public; Owner: LaravelDockerImagem
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.users OWNER TO "LaravelDockerImagem";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: LaravelDockerImagem
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO "LaravelDockerImagem";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: LaravelDockerImagem
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: LaravelDockerImagem
--

CREATE TABLE public.usuarios (
    id bigint NOT NULL,
    nome character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    senha character varying(255) NOT NULL,
    imagem_perfil character varying(255),
    crp character varying(20),
    tipo character varying(255) NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    role character varying(255) DEFAULT 'user'::character varying NOT NULL,
    remember_token character varying(100),
    criado_em timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT usuarios_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['psicologo'::character varying, 'usuario'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO "LaravelDockerImagem";

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: LaravelDockerImagem
--

CREATE SEQUENCE public.usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO "LaravelDockerImagem";

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: LaravelDockerImagem
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: videos; Type: TABLE; Schema: public; Owner: LaravelDockerImagem
--

CREATE TABLE public.videos (
    id bigint NOT NULL,
    titulo character varying(100) NOT NULL,
    descricao text,
    arquivo character varying(255) NOT NULL,
    premium boolean DEFAULT false NOT NULL,
    data_criacao timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    autor_id bigint
);


ALTER TABLE public.videos OWNER TO "LaravelDockerImagem";

--
-- Name: videos_id_seq; Type: SEQUENCE; Schema: public; Owner: LaravelDockerImagem
--

CREATE SEQUENCE public.videos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.videos_id_seq OWNER TO "LaravelDockerImagem";

--
-- Name: videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: LaravelDockerImagem
--

ALTER SEQUENCE public.videos_id_seq OWNED BY public.videos.id;


--
-- Name: anotacoes id; Type: DEFAULT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.anotacoes ALTER COLUMN id SET DEFAULT nextval('public.anotacoes_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: videos id; Type: DEFAULT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.videos ALTER COLUMN id SET DEFAULT nextval('public.videos_id_seq'::regclass);


--
-- Data for Name: anotacoes; Type: TABLE DATA; Schema: public; Owner: LaravelDockerImagem
--

COPY public.anotacoes (id, usuario_id, titulo, texto, data_criacao) FROM stdin;
1	1	Anotação exemplo 1	Este é o texto da anotação número 1.	2025-12-01 04:59:31
2	2	Anotação exemplo 2	Este é o texto da anotação número 2.	2025-12-01 04:59:31
3	3	Anotação exemplo 3	Este é o texto da anotação número 3.	2025-12-01 04:59:31
4	3	Anotação exemplo 4	Este é o texto da anotação número 4.	2025-12-01 04:59:31
5	3	Anotação exemplo 5	Este é o texto da anotação número 5.	2025-12-01 04:59:31
6	3	Anotação exemplo 6	Este é o texto da anotação número 6.	2025-12-01 04:59:31
7	3	Anotação exemplo 7	Este é o texto da anotação número 7.	2025-12-01 04:59:31
8	3	Anotação exemplo 8	Este é o texto da anotação número 8.	2025-12-01 04:59:31
9	1	Anotação exemplo 9	Este é o texto da anotação número 9.	2025-12-01 04:59:31
10	2	Anotação exemplo 10	Este é o texto da anotação número 10.	2025-12-01 04:59:31
11	2	Minha anotação API	Texto da anotação.	2025-12-01 05:00:17
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: LaravelDockerImagem
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: LaravelDockerImagem
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: LaravelDockerImagem
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: LaravelDockerImagem
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: LaravelDockerImagem
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: LaravelDockerImagem
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2025_10_09_005840_create_usuarios_table	1
5	2025_10_09_005952_create_videos_table	1
6	2025_10_09_010016_create_anotacaos_table	1
7	2025_11_27_040852_create_personal_access_tokens_table	1
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: LaravelDockerImagem
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: LaravelDockerImagem
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
1	App\\Models\\User	2	auth_token	10ccf89b2c33e48a5f9b922460bf07474c1c394b2770480a0488f1161db2800e	["premium"]	2025-12-01 05:00:52	\N	2025-12-01 04:59:47	2025-12-01 05:00:52
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: LaravelDockerImagem
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: LaravelDockerImagem
--

COPY public.users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: LaravelDockerImagem
--

COPY public.usuarios (id, nome, email, senha, imagem_perfil, crp, tipo, is_admin, role, remember_token, criado_em) FROM stdin;
1	Admin Psicólogo	admin@mindup.com	$2y$12$mqKC2J1YL2eh5R3ev5EOyeV38oS6dohxMxEfLQEYpt3nid8dMJzRu	\N	\N	psicologo	t	admin	\N	2025-12-01 04:59:29
2	erick	erick@gmail.com	$2y$12$XIjWx1N68OMZTOx054qLV.cwYTnCFiWjOyqWscqisyz7MJdfmUEJW	\N	\N	usuario	f	user	\N	2025-12-01 04:59:29
3	Dr. David Ferraz Sobrinho	sandra26@example.net	$2y$12$Z8wt6OOQBSwQVkTTnJraNechL/andzWw/nZVnh9dEIheBlTGdmQBu	\N	\N	usuario	f	user	\N	2025-12-01 04:59:30
4	Dr. Adriele Késia Pontes Neto	dener.goncalves@example.org	$2y$12$ZL6FR4.vSqt.EmacOZhfBuBKYmAZa6m1v9AAE7D/6tlv045zgmgn2	\N	\N	usuario	f	user	\N	2025-12-01 04:59:30
5	Ricardo Tomás Azevedo	naiara.marin@example.net	$2y$12$ukRZniGaJ1pyFT6QvxYxHu7x.IbJMrXzmXR3OQ9BlIloOgQZIezNu	\N	\N	usuario	f	user	\N	2025-12-01 04:59:30
\.


--
-- Data for Name: videos; Type: TABLE DATA; Schema: public; Owner: LaravelDockerImagem
--

COPY public.videos (id, titulo, descricao, arquivo, premium, data_criacao, autor_id) FROM stdin;
1	Como lidar com ansiedade	Um guia introdutório para gerenciamento da ansiedade.	https://www.youtube.com/watch?v=abc123	t	2025-12-01 04:59:31	1
2	Respiração diafragmática	Técnica de respiração para relaxamento.	https://www.youtube.com/watch?v=def456	f	2025-12-01 04:59:31	1
3	Mindfulness para iniciantes	Aprenda o básico sobre atenção plena.	https://www.youtube.com/watch?v=ghi789	f	2025-12-01 04:59:31	\N
\.


--
-- Name: anotacoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: LaravelDockerImagem
--

SELECT pg_catalog.setval('public.anotacoes_id_seq', 11, true);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: LaravelDockerImagem
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: LaravelDockerImagem
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: LaravelDockerImagem
--

SELECT pg_catalog.setval('public.migrations_id_seq', 7, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: LaravelDockerImagem
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: LaravelDockerImagem
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: LaravelDockerImagem
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 5, true);


--
-- Name: videos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: LaravelDockerImagem
--

SELECT pg_catalog.setval('public.videos_id_seq', 3, true);


--
-- Name: anotacoes anotacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.anotacoes
    ADD CONSTRAINT anotacoes_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_unique; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_unique UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: LaravelDockerImagem
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: LaravelDockerImagem
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: LaravelDockerImagem
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: LaravelDockerImagem
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: LaravelDockerImagem
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: anotacoes anotacoes_usuario_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.anotacoes
    ADD CONSTRAINT anotacoes_usuario_id_foreign FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: videos videos_autor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: LaravelDockerImagem
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_autor_id_foreign FOREIGN KEY (autor_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict eFakI2vfNG1WnrVjornciDFl27tzRfnm9OpZbf7bPQmXGacH2oGML9u3tAQa5h4

