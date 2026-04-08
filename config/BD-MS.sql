-- Usuários
CREATE TABLE usuario_clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  sobrenome VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  celular VARCHAR(20),
  cep VARCHAR(10),
  logradouro VARCHAR(200),
  numero VARCHAR(10),
  tipo VARCHAR(20) DEFAULT 'usuario',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Empresas
CREATE TABLE empresas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  cnpj VARCHAR(20) UNIQUE,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  celular VARCHAR(20),
  cep VARCHAR(10),
  logradouro VARCHAR(200),
  tipo VARCHAR(20) DEFAULT 'empresa',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Locais gratuitos
CREATE TABLE locais (
  id SERIAL PRIMARY KEY,
  nome_local VARCHAR(150),
  categoria VARCHAR(100),
  descricao TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Locais premium
CREATE TABLE local_premium (
  id_local_premium SERIAL PRIMARY KEY,
  fk_id_empresa INT REFERENCES empresas(id),
  nome_local_premium VARCHAR(150),
  categoria VARCHAR(100),
  categoria_2 VARCHAR(100),
  descricao TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Espaços dos locais premium
CREATE TABLE espaco_local (
  id SERIAL PRIMARY KEY,
  fk_id_local_premium INT REFERENCES local_premium(id_local_premium),
  nome_espaco VARCHAR(150),
  preco_hora DECIMAL(10,2)
);

-- Dias de atuação
CREATE TABLE dia_atuacao (
  id SERIAL PRIMARY KEY,
  fk_id_local_premium INT REFERENCES local_premium(id_local_premium),
  dia_semana VARCHAR(20),
  horario_inicio TIME,
  horario_fim TIME
);

-- Produtos das empresas
CREATE TABLE produtos_das_empresas (
  id SERIAL PRIMARY KEY,
  titulo_prod VARCHAR(150),
  descricao_prod TEXT,
  categoria_prod VARCHAR(100),
  tipo_prod VARCHAR(100),
  roupa_prod VARCHAR(100),
  link_prod VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Preços dos produtos
CREATE TABLE preco_prod (
  id SERIAL PRIMARY KEY,
  fk_id_prod INT REFERENCES produtos_das_empresas(id),
  valor_prod DECIMAL(10,2),
  ini_vig DATE
);

-- Vínculo empresa-produto
CREATE TABLE empresas_produtos (
  id SERIAL PRIMARY KEY,
  fk_id_emp INT REFERENCES empresas(id),
  fk_id_prod INT REFERENCES produtos_das_empresas(id)
);

-- Imagens
CREATE TABLE imagens (
  id SERIAL PRIMARY KEY,
  fk_local_id INT,
  fk_local_premium_id INT,
  fk_id_prod INT,
  nome_imagem VARCHAR(255),
  ordem_img INT DEFAULT 0
);

-- Avaliações de locais do banco
CREATE TABLE avaliacao_local (
  id SERIAL PRIMARY KEY,
  fk_id_cliente INT REFERENCES usuario_clientes(id),
  fk_id_local INT REFERENCES locais(id),
  fk_id_local_premium INT REFERENCES local_premium(id_local_premium),
  comentario_local TEXT,
  avaliacao_estrela_locais INT
);

-- Avaliações Google Places
CREATE TABLE avaliacao_googleplaces (
  id SERIAL PRIMARY KEY,
  fk_id_cliente INT REFERENCES usuario_clientes(id),
  fk_id_google VARCHAR(100),
  comentario_local TEXT,
  avaliacao_estrela_locais INT
);

-- Favoritos
CREATE TABLE favorito_locais (
  id SERIAL PRIMARY KEY,
  fk_id_cliente INT REFERENCES usuario_clientes(id),
  fk_id_local INT,
  fk_id_google VARCHAR(100)
);

-- Reservas
CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  fk_id_cliente INT REFERENCES usuario_clientes(id),
  fk_id_espaco INT REFERENCES espaco_local(id),
  data_reserva DATE,
  horario_inicio TIME,
  horario_fim TIME,
  status VARCHAR(20) DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT NOW()
);