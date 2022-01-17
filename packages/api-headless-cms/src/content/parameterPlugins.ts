import WebinyError from "@webiny/error";
import {
    CmsParametersPlugin,
    CmsParametersPluginResponse
} from "~/content/plugins/CmsParametersPlugin";

export interface CreateParametersPluginsParams {
    endpointType?: CmsParametersPluginResponse["type"];
    locale?: CmsParametersPluginResponse["locale"];
}

const createRequestPlugin = () => {
    return new CmsParametersPlugin(async context => {
        /**
         * If any of the properties is not defined, just ignore this plugin
         */
        if (
            !context.http ||
            !context.http.request ||
            !context.http.request.path ||
            !context.http.request.path.parameters
        ) {
            return null;
        }

        const { key } = context.http.request.path.parameters;
        if (typeof key !== "string") {
            throw new WebinyError(
                "The key property in context.http.request.path.parameters is not a string.",
                "MALFORMED_KEY",
                {
                    key
                }
            );
        }
        const [type, locale] = key.split("/");
        if (!type) {
            throw new WebinyError(
                `Missing context.http.request.path.parameters.key parameter "type".`
            );
        } else if (!locale) {
            throw new WebinyError(`Missing context.http.request.path.parameters.key "locale".`);
        }

        return {
            type,
            locale
        };
    });
};

const createManualPlugin = (params: CreateParametersPluginsParams): CmsParametersPlugin => {
    return new CmsParametersPlugin(async () => {
        /**
         * if both of parameters are not existing, just skip this plugin.
         */
        if (!params.endpointType && !params.locale) {
            return null;
        } else if (!params.endpointType) {
            throw new WebinyError(
                `There is defined locale CMS parameter but no endpointType.`,
                "MALFORMED_ENDPOINT_TYPE",
                {
                    ...params
                }
            );
        } else if (!params.locale) {
            throw new WebinyError(
                `There is defined endpointType CMS parameter but no locale.`,
                "MALFORMED_LOCALE_TYPE",
                {
                    ...params
                }
            );
        }

        return {
            type: params.endpointType,
            locale: params.locale
        };
    });
};
export const createParametersPlugins = (
    params: CreateParametersPluginsParams
): CmsParametersPlugin[] => {
    return [createManualPlugin(params), createRequestPlugin()];
};
