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

export interface ServiceImage {
  /**
   * Img url
   * @minLength 1
   */
  img_url: string;
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

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8000/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Snippets API
 * @version v1
 * @license BSD License
 * @termsOfService https://www.google.com/policies/terms/
 * @baseUrl http://localhost:8000/api
 * @contact <contact@snippets.local>
 *
 * Test description
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
      this.request<Message, Message>({
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
     * @description PUT сформировать заявку (создатель = фиксированный пользователь). Ставит статус 'formed' и requested_at.
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
     * @description PUT изменить значения в М-М: по замечанию оставляем comment.
     *
     * @tags support_request
     * @name SupportRequestLineUpdate
     * @request PUT:/support_request/{rid}/line/{line_id}
     * @secure
     */
    supportRequestLineUpdate: (
      rid: string,
      lineId: string,
      data: RequestLineUpdate,
      params: RequestParams = {},
    ) =>
      this.request<LineUpdateResponse, Message>({
        path: `/support_request/${rid}/line/${lineId}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description DELETE строку из заявки (без удаления самой заявки).
     *
     * @tags support_request
     * @name SupportRequestLineDeleteDelete
     * @request DELETE:/support_request/{rid}/line/{line_id}/delete
     * @secure
     */
    supportRequestLineDeleteDelete: (
      rid: string,
      lineId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, Message>({
        path: `/support_request/${rid}/line/${lineId}/delete`,
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
     * No description
     *
     * @tags support_service
     * @name SupportServiceImageUpdate
     * @request PUT:/support_service/{service_id}/image
     * @secure
     */
    supportServiceImageUpdate: (
      serviceId: string,
      data: ServiceImage,
      params: RequestParams = {},
    ) =>
      this.request<ServiceImageResponse, Message>({
        path: `/support_service/${serviceId}/image`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
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
     * No description
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
