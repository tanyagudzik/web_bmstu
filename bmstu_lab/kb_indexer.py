"""
Пайплайн индексации статей БЗ в Redis Vector Search.

Статья → chunking → embedding (sentence-transformers) → Redis HSET + FT.CREATE

Источники:
  [5] EdgeRAG — Selective Index Storage для edge-устройств
  [4] Veturi et al. — RAG architecture для контакт-центра
"""
import json
import logging
from typing import Optional

import numpy as np
import redis
from django.conf import settings

logger = logging.getLogger(__name__)

# Индекс и префикс ключей в Redis
INDEX_NAME = "idx:kb_chunks"
KEY_PREFIX = "kb:chunk:"

# Размер чанка и перекрытие (в символах)
CHUNK_SIZE = 500
CHUNK_OVERLAP = 100

# Embedding модель — мультиязычная, работает с русским
EMBEDDING_MODEL_NAME = "intfloat/multilingual-e5-base"
EMBEDDING_DIM = 768

_model = None


def get_embedding_model():
    """Lazy-load модели для экономии памяти при старте Django."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        logger.info(f"Загружена embedding-модель: {EMBEDDING_MODEL_NAME}")
    return _model


def get_redis_client() -> redis.Redis:
    return redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        decode_responses=False,  # для бинарных данных (векторы)
    )


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE,
               overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Разбивает текст на перекрывающиеся фрагменты."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


def create_index(r: redis.Redis):
    """Создаёт поисковый индекс в Redis (FT.CREATE)."""
    from redis.commands.search.field import (
        TextField, NumericField, VectorField,
    )
    from redis.commands.search.index_definition import (
        IndexDefinition, IndexType,
    )

    try:
        r.ft(INDEX_NAME).info()
        logger.info(f"Индекс {INDEX_NAME} уже существует")
        return
    except redis.exceptions.ResponseError:
        pass

    schema = (
        TextField("text"),
        NumericField("article_id"),
        TextField("article_title"),
        TextField("category"),
        NumericField("chunk_index"),
        VectorField(
            "embedding",
            "FLAT",
            {
                "TYPE": "FLOAT32",
                "DIM": EMBEDDING_DIM,
                "DISTANCE_METRIC": "COSINE",
            },
        ),
    )

    definition = IndexDefinition(
        prefix=[KEY_PREFIX],
        index_type=IndexType.HASH,
    )

    r.ft(INDEX_NAME).create_index(
        fields=schema,
        definition=definition,
    )
    logger.info(f"Создан индекс {INDEX_NAME}")


def index_article(article, r: Optional[redis.Redis] = None):
    """
    Индексирует одну статью БЗ:
    1. Удаляет старые чанки этой статьи
    2. Разбивает текст на чанки
    3. Считает эмбеддинги
    4. Сохраняет в Redis
    """
    if r is None:
        r = get_redis_client()

    create_index(r)

    # Удалить старые чанки этой статьи
    delete_article_chunks(article.id, r)

    # Разбить на чанки
    full_text = f"{article.title}. {article.content}"
    chunks = chunk_text(full_text)

    if not chunks:
        logger.warning(f"Статья {article.id} не содержит текста для индексации")
        return

    # Считать эмбеддинги
    model = get_embedding_model()
    # Добавляем префикс "query: " для E5-модели
    prefixed = [f"passage: {c}" for c in chunks]
    embeddings = model.encode(prefixed, normalize_embeddings=True)

    # Сохранить в Redis
    pipe = r.pipeline()
    for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
        key = f"{KEY_PREFIX}{article.id}:{i}"
        pipe.hset(key, mapping={
            "text": chunk,
            "article_id": article.id,
            "article_title": article.title,
            "category": article.category,
            "chunk_index": i,
            "embedding": np.array(emb, dtype=np.float32).tobytes(),
        })
    pipe.execute()

    logger.info(f"Проиндексировано {len(chunks)} чанков для статьи #{article.id}")


def delete_article_chunks(article_id: int, r: Optional[redis.Redis] = None):
    """Удаляет все чанки статьи из Redis."""
    if r is None:
        r = get_redis_client()

    pattern = f"{KEY_PREFIX}{article_id}:*"
    keys = list(r.scan_iter(match=pattern))
    if keys:
        r.delete(*keys)
        logger.info(f"Удалено {len(keys)} чанков статьи #{article_id}")


def search_similar(query: str, top_k: int = 5) -> list[dict]:
    """
    Семантический поиск по базе знаний.

    1. Считает эмбеддинг запроса
    2. Делает KNN-поиск по Redis
    3. Возвращает Top-K фрагментов
    """
    from redis.commands.search.query import Query

    r = get_redis_client()
    model = get_embedding_model()

    # E5-модель требует префикс "query: " для запросов
    query_emb = model.encode(
        f"query: {query}", normalize_embeddings=True
    )
    query_bytes = np.array(query_emb, dtype=np.float32).tobytes()

    q = (
        Query(f"(*)=>[KNN {top_k} @embedding $query_vec AS score]")
        .sort_by("score")
        .return_fields("text", "article_id", "article_title", "category",
                       "chunk_index", "score")
        .dialect(2)
    )

    results = r.ft(INDEX_NAME).search(q, query_params={"query_vec": query_bytes})

    chunks = []
    for doc in results.docs:
        chunks.append({
            "text": doc.text if isinstance(doc.text, str) else doc.text.decode(),
            "article_id": int(doc.article_id),
            "article_title": (doc.article_title
                              if isinstance(doc.article_title, str)
                              else doc.article_title.decode()),
            "category": (doc.category
                         if isinstance(doc.category, str)
                         else doc.category.decode()),
            "chunk_index": int(doc.chunk_index),
            "score": float(doc.score),
        })

    return chunks


def index_all_articles():
    """Индексирует все активные статьи БЗ."""
    from bmstu_lab.models import KBArticle

    r = get_redis_client()
    create_index(r)

    articles = KBArticle.objects.filter(is_active=True)
    total = 0
    for article in articles:
        index_article(article, r)
        total += 1

    logger.info(f"Проиндексировано {total} статей")
    return total