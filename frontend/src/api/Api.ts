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

export interface ServiceImage {
  /**
   * Img url
   * @minLength 1
   */
  img_url: string;
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
      this.request<void, any>({
        path: `/kb/article/${articleId}`,
        method: "GET",
        secure: true,
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
    kbArticlesList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/kb/articles`,
        method: "GET",
        secure: true,
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
    kbSearchList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/kb/search`,
        method: "GET",
        secure: true,
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
      this.request<Login, any>({
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
      this.request<void, any>({
        path: `/logout`,
        method: "POST",
        secure: true,
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
    metricsCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/metrics`,
        method: "POST",
        secure: true,
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
      this.request<Register, any>({
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
      this.request<void, any>({
        path: `/support_request/cart`,
        method: "GET",
        secure: true,
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
      this.request<void, any>({
        path: `/support_request/${rid}`,
        method: "GET",
        secure: true,
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
      this.request<void, any>({
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
      this.request<void, any>({
        path: `/support_request/${rid}/finish`,
        method: "PUT",
        secure: true,
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
      this.request<void, any>({
        path: `/support_request/${rid}/form`,
        method: "PUT",
        secure: true,
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
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/support_request/${rid}/line/${lineId}`,
        method: "PUT",
        secure: true,
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
      this.request<void, any>({
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
      this.request<void, any>({
        path: `/support_request/${rid}/reject`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * @description PUT изменить поля заявки (комнату, описание и т.п.). Пример JSON: { "room": "207", "comment": "Срочно" }
     *
     * @tags support_request
     * @name SupportRequestUpdateUpdate
     * @request PUT:/support_request/{rid}/update
     * @secure
     */
    supportRequestUpdateUpdate: (rid: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/support_request/${rid}/update`,
        method: "PUT",
        secure: true,
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
    supportRequestsList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/support_requests`,
        method: "GET",
        secure: true,
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
      this.request<void, any>({
        path: `/support_service/${serviceId}`,
        method: "GET",
        secure: true,
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
      this.request<void, any>({
        path: `/support_service/${serviceId}/add_to_request`,
        method: "POST",
        secure: true,
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
      this.request<ServiceImage, any>({
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
    supportServicesList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/support_services`,
        method: "GET",
        secure: true,
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
      this.request<SupportService, any>({
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
