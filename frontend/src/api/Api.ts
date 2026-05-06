/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface KBArticleImage {
  /** ID */
  id?: number;
  /**
   * URL изображения
   * @minLength 1
   */
  image_url: string;
  /**
   * Alt / описание
   * @maxLength 500
   */
  alt_text?: string;
  /**
   * Порядок
   * @min 0
   * @max 2147483647
   */
  sort_order?: number;
}

export interface KBArticle {
  /** ID */
  id?: number;
  /**
   * Заголовок
   * @minLength 1
   * @maxLength 300
   */
  title: string;
  /**
   * Содержание
   * @minLength 1
   */
  content: string;
  /**
   * Описание (англ., для SigLIP)
   * English description for SigLIP embedding. Required.
   * @minLength 1
   */
  description: string;
  /**
   * Теги
   * @maxLength 500
   */
  tags?: string;
  /** Категория */
  category?:
    | "network"
    | "printer"
    | "software"
    | "hardware"
    | "email"
    | "access"
    | "other";
  /** URL скриншота */
  img_url?: string | null;
  /** Активна */
  is_active?: boolean;
  /**
   * Создано
   * @format date-time
   */
  created_at?: string;
  images?: KBArticleImage[];
}

export interface Message {
  /**
   * Detail
   * @minLength 1
   */
  detail: string;
}

export interface ImageUploadResponse {
  /**
   * Detail
   * @minLength 1
   */
  detail: string;
  /**
   * Url
   * @minLength 1
   */
  url: string;
}

export interface KBSearchResult {
  /**
   * Text
   * @minLength 1
   */
  text: string;
  /** Article id */
  article_id: number;
  /**
   * Article title
   * @minLength 1
   */
  article_title: string;
  /**
   * Category
   * @minLength 1
   */
  category: string;
  /** Chunk index */
  chunk_index: number;
  /** Score */
  score: number;
}

export interface KBSearchResponse {
  /**
   * Query
   * @minLength 1
   */
  query: string;
  results: KBSearchResult[];
}

export interface Login {
  /**
   * Email
   * @format email
   * @minLength 1
   */
  email: string;
  /**
   * Password
   * @minLength 1
   */
  password: string;
}

export interface LoginResponse {
  /**
   * Detail
   * @minLength 1
   */
  detail: string;
  /** Is staff */
  is_staff: boolean;
}

export interface MetricsIngest {
  /** Agent context ms */
  agent_context_ms?: number;
  /** Agent ranking ms */
  agent_ranking_ms?: number;
  /** Agent generation ms */
  agent_generation_ms?: number;
  /** Agent validation ms */
  agent_validation_ms?: number;
  /** Total ms */
  total_ms?: number;
  /** Faithful */
  faithful?: boolean;
  /**
   * Model
   * @minLength 1
   */
  model?: string;
}

export interface MetricsResponse {
  /**
   * Status
   * @minLength 1
   */
  status: string;
  /**
   * Warning
   * @minLength 1
   */
  warning?: string;
}

export interface Register {
  /**
   * Email
   * @format email
   * @minLength 1
   */
  email: string;
  /**
   * Username
   * @minLength 1
   */
  username: string;
  /**
   * Password
   * @minLength 1
   */
  password: string;
}

export interface CartResponse {
  /** Request id */
  request_id?: number | null;
  /** Count */
  count: number;
}

export interface SupportRequestLine {
  /** ID */
  id?: number;
  /** Service id */
  service_id?: number;
  /**
   * Service name
   * @minLength 1
   */
  service_name?: string;
  /**
   * Eta
   * @minLength 1
   */
  eta?: string;
  /**
   * Img url
   * @minLength 1
   */
  img_url?: string;
  /** Комментарий */
  comment?: string | null;
  /** Галочка */
  ok?: boolean | null;
}

export interface SupportRequest {
  /** ID */
  id?: number;
  /**
   * Status
   * @minLength 1
   */
  status?: string;
  /**
   * Requester
   * @format email
   * @minLength 1
   */
  requester?: string;
  /**
   * Engineer
   * @format email
   * @minLength 1
   */
  engineer?: string;
  /**
   * Создано
   * @format date-time
   */
  created_at?: string;
  /**
   * Дата формирования
   * @format date-time
   */
  requested_at?: string | null;
  /**
   * Дата завершения
   * @format date-time
   */
  finished_at?: string | null;
  /**
   * Кабинет
   * @maxLength 50
   */
  room?: string | null;
  /** Count ok */
  count_ok?: string;
  lines?: SupportRequestLine[];
}

export interface FinishResponse {
  /**
   * Status
   * @minLength 1
   */
  status: string;
  /**
   * Finished at
   * @format date-time
   */
  finished_at: string;
}

export interface FormResponse {
  /**
   * Status
   * @minLength 1
   */
  status: string;
  /**
   * Requested at
   * @format date-time
   */
  requested_at: string;
}

export interface RequestLineUpdate {
  /**
   * Comment
   * @minLength 1
   */
  comment?: string;
}

export interface LineUpdateResponse {
  /** Id */
  id: number;
  /**
   * Comment
   * @minLength 1
   */
  comment: string;
}

export interface RejectResponse {
  /**
   * Status
   * @minLength 1
   */
  status: string;
  /**
   * Finished at
   * @format date-time
   */
  finished_at: string;
}

export interface SupportRequestUpdate {
  /**
   * Room
   * @minLength 1
   */
  room?: string;
}

export interface SupportService {
  /** ID */
  id?: number;
  /**
   * Название
   * @minLength 1
   * @maxLength 200
   */
  title: string;
  /** Описание */
  description?: string;
  /**
   * Ожидание
   * @maxLength 20
   */
  eta?: string;
  /** Адрес картинки */
  img_url?: string | null;
  /** Активна */
  is_active?: boolean;
}

export interface AddToRequestResponse {
  /** Request id */
  request_id: number;
}

export interface ServiceImageResponse {
  /** Id */
  id: number;
  /**
   * Title
   * @minLength 1
   */
  title: string;
  /**
   * Img url
   * @minLength 1
   */
  img_url: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:8000/api";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title IT Support Portal API
 * @version v1
 * @license MIT License
 * @baseUrl http://localhost:8000/api
 * @contact <admin@bmstu.ru>
 *
 * REST API портала удалённой техподдержки с мультиагентным RAG-конвейером
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  kb = {
    /**
     * @description GET одна статья БЗ.
     *
     * @tags kb
     * @name KbArticleRead
     * @request GET:/kb/article/{article_id}
     * @secure
     */
    kbArticleRead: (articleId: string, params: RequestParams = {}) =>
      this.request<KBArticle, Message>({
        path: `/kb/article/${articleId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description PUT загрузка изображения статьи БЗ через MinIO.
     *
     * @tags kb
     * @name KbArticleImageUpdate
     * @request PUT:/kb/article/{article_id}/image
     * @secure
     */
    kbArticleImageUpdate: (
      articleId: string,
      data: {
        /**
         * Файл изображения статьи БЗ
         * @format binary
         */
        pic: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<ImageUploadResponse, Message>({
        path: `/kb/article/${articleId}/image`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description GET список статей БЗ с фильтром ?q= и ?category=.
     *
     * @tags kb
     * @name KbArticlesList
     * @request GET:/kb/articles
     * @secure
     */
    kbArticlesList: (
      query?: {
        /** Поиск по заголовку, содержанию, тегам */
        q?: string;
        /** Фильтр по категории */
        category?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<KBArticle[], any>({
        path: `/kb/articles`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description GET /api/kb/search/?q=текст запроса&top_k=5 Семантический поиск по базе знаний через Redis Vector Search.
     *
     * @tags kb
     * @name KbSearchList
     * @request GET:/kb/search
     * @secure
     */
    kbSearchList: (
      query: {
        /** Текст запроса для семантического поиска */
        q: string;
        /** Количество результатов (макс. 20) */
        top_k?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<KBSearchResponse, Message>({
        path: `/kb/search`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  login = {
    /**
     * No description
     *
     * @tags login
     * @name LoginCreate
     * @request POST:/login
     * @secure
     */
    loginCreate: (data: Login, params: RequestParams = {}) =>
      this.request<LoginResponse, Message>({
        path: `/login`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  logout = {
    /**
     * No description
     *
     * @tags logout
     * @name LogoutCreate
     * @request POST:/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<Message, any>({
        path: `/logout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  metrics = {
    /**
     * @description POST /api/metrics/ Приём клиентских метрик (latency агентов, faithfulness) → Pushgateway.
     *
     * @tags metrics
     * @name MetricsCreate
     * @request POST:/metrics
     * @secure
     */
    metricsCreate: (data: MetricsIngest, params: RequestParams = {}) =>
      this.request<MetricsResponse, any>({
        path: `/metrics`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  register = {
    /**
     * No description
     *
     * @tags register
     * @name RegisterCreate
     * @request POST:/register
     * @secure
     */
    registerCreate: (data: Register, params: RequestParams = {}) =>
      this.request<Message, Message>({
        path: `/register`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  supportRequest = {
    /**
     * @description GET иконки корзины (без входных параметров): возвращает id черновика и количество услуг в нём.
     *
     * @tags support_request
     * @name SupportRequestCartList
     * @request GET:/support_request/cart
     * @secure
     */
    supportRequestCartList: (params: RequestParams = {}) =>
      this.request<CartResponse, Message>({
        path: `/support_request/cart`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description GET одна заявка (+ её услуги). Удалённые не возвращаем.
     *
     * @tags support_request
     * @name SupportRequestRead
     * @request GET:/support_request/{rid}
     * @secure
     */
    supportRequestRead: (rid: string, params: RequestParams = {}) =>
      this.request<SupportRequest, Message>({
        path: `/support_request/${rid}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description DELETE логическое удаление черновика.
     *
     * @tags support_request
     * @name SupportRequestDeleteDelete
     * @request DELETE:/support_request/{rid}/delete
     * @secure
     */
    supportRequestDeleteDelete: (rid: string, params: RequestParams = {}) =>
      this.request<void, Message>({
        path: `/support_request/${rid}/delete`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description PUT завершить заявку (модератором). 'результат'это случайная галочка в М-М.
     *
     * @tags support_request
     * @name SupportRequestFinishUpdate
     * @request PUT:/support_request/{rid}/finish
     * @secure
     */
    supportRequestFinishUpdate: (rid: string, params: RequestParams = {}) =>
      this.request<FinishResponse, Message>({
        path: `/support_request/${rid}/finish`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description PUT сформировать заявку (создатель = фиксированный пользователь). Ставит статус 'formed' и requested_at. Валидация: заявка должна содержать хотя бы одну услугу и обязательное поле room. Расчёт: при формировании вычисляется amount в каждой строке м-м (qty * service.id как заглушка).
     *
     * @tags support_request
     * @name SupportRequestFormUpdate
     * @request PUT:/support_request/{rid}/form
     * @secure
     */
    supportRequestFormUpdate: (rid: string, params: RequestParams = {}) =>
      this.request<FormResponse, Message>({
        path: `/support_request/${rid}/form`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description PUT изменить строку м-м по (rid, service_id) — без PK м-м (по требованию ЛР3).
     *
     * @tags support_request
     * @name SupportRequestLineUpdate
     * @request PUT:/support_request/{rid}/line/{service_id}
     * @secure
     */
    supportRequestLineUpdate: (
      rid: string,
      serviceId: string,
      data: RequestLineUpdate,
      params: RequestParams = {},
    ) =>
      this.request<LineUpdateResponse, Message>({
        path: `/support_request/${rid}/line/${serviceId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description DELETE строку из заявки по (rid, service_id) — без PK м-м (по требованию ЛР3).
     *
     * @tags support_request
     * @name SupportRequestLineDeleteDelete
     * @request DELETE:/support_request/{rid}/line/{service_id}/delete
     * @secure
     */
    supportRequestLineDeleteDelete: (
      rid: string,
      serviceId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, Message>({
        path: `/support_request/${rid}/line/${serviceId}/delete`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description PUT отклонить заявку (модератором).
     *
     * @tags support_request
     * @name SupportRequestRejectUpdate
     * @request PUT:/support_request/{rid}/reject
     * @secure
     */
    supportRequestRejectUpdate: (rid: string, params: RequestParams = {}) =>
      this.request<RejectResponse, Message>({
        path: `/support_request/${rid}/reject`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description PUT изменить поля заявки (кабинет). Пример JSON: { "room": "207" }
     *
     * @tags support_request
     * @name SupportRequestUpdateUpdate
     * @request PUT:/support_request/{rid}/update
     * @secure
     */
    supportRequestUpdateUpdate: (
      rid: string,
      data: SupportRequestUpdate,
      params: RequestParams = {},
    ) =>
      this.request<SupportRequest, Message>({
        path: `/support_request/${rid}/update`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  supportRequests = {
    /**
     * @description GET список заявок (для фильтров): ?status=formed|finished|rejected|draft ?date_from=YYYY-MM-DD  (по requested_at) ?date_to=YYYY-MM-DD
     *
     * @tags support_requests
     * @name SupportRequestsList
     * @request GET:/support_requests
     * @secure
     */
    supportRequestsList: (
      query?: {
        /** Фильтр по статусу: formed|finished|rejected|draft */
        status?: string;
        /** Дата от (YYYY-MM-DD) */
        date_from?: string;
        /** Дата до (YYYY-MM-DD) */
        date_to?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SupportRequest[], Message>({
        path: `/support_requests`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  supportService = {
    /**
     * @description GET одна услуга.
     *
     * @tags support_service
     * @name SupportServiceRead
     * @request GET:/support_service/{service_id}
     * @secure
     */
    supportServiceRead: (serviceId: string, params: RequestParams = {}) =>
      this.request<SupportService, Message>({
        path: `/support_service/${serviceId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description POST добавление услуги в текущую заявку-черновик.
     *
     * @tags support_service
     * @name SupportServiceAddToRequestCreate
     * @request POST:/support_service/{service_id}/add_to_request
     * @secure
     */
    supportServiceAddToRequestCreate: (
      serviceId: string,
      params: RequestParams = {},
    ) =>
      this.request<AddToRequestResponse, Message>({
        path: `/support_service/${serviceId}/add_to_request`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description PUT загрузка изображения услуги через MinIO (по методичке ЛР3).
     *
     * @tags support_service
     * @name SupportServiceImageUpdate
     * @request PUT:/support_service/{service_id}/image
     * @secure
     */
    supportServiceImageUpdate: (
      serviceId: string,
      data: {
        /**
         * Файл изображения
         * @format binary
         */
        pic: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<ServiceImageResponse, Message>({
        path: `/support_service/${serviceId}/image`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  supportServices = {
    /**
     * @description GET список услуг с фильтром ?q= ; удалённые и неактивные не отдаём.
     *
     * @tags support_services
     * @name SupportServicesList
     * @request GET:/support_services
     * @secure
     */
    supportServicesList: (
      query?: {
        /** Фильтр по названию услуги */
        q?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SupportService[], any>({
        path: `/support_services`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description POST создание услуги (JSON). Изображение загружается отдельно через PUT /image.
     *
     * @tags support_services
     * @name SupportServicesCreateCreate
     * @request POST:/support_services/create
     * @secure
     */
    supportServicesCreateCreate: (
      data: SupportService,
      params: RequestParams = {},
    ) =>
      this.request<SupportService, Message>({
        path: `/support_services/create`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
