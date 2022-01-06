import { SecurityIdentity } from "@webiny/api-security/types";
import workflowMocks from "../graphql/mocks/workflows";

export { until } from "@webiny/project-utils/testing/helpers/until";
export { sleep } from "@webiny/project-utils/testing/helpers/sleep";

export interface PermissionsArg {
    name: string;
    locales?: string[];
    rwd?: string;
    pw?: string;
    own?: boolean;
}

export const identity = {
    id: "12345678",
    displayName: "John Doe",
    type: "admin"
};

const getSecurityIdentity = () => {
    return identity;
};

export const createPermissions = (permissions: PermissionsArg[]): PermissionsArg[] => {
    if (permissions) {
        return permissions;
    }
    return [
        {
            name: "cms.settings"
        },
        {
            name: "cms.contentModel",
            rwd: "rwd"
        },
        {
            name: "cms.contentModelGroup",
            rwd: "rwd"
        },
        {
            name: "cms.contentEntry",
            rwd: "rwd",
            pw: "rcpu"
        },
        {
            name: "cms.endpoint.read"
        },
        {
            name: "cms.endpoint.manage"
        },
        {
            name: "cms.endpoint.preview"
        },
        {
            name: "content.i18n",
            locales: ["en-US"]
        }
    ];
};

export const createIdentity = (identity?: SecurityIdentity) => {
    if (!identity) {
        return getSecurityIdentity();
    }
    return identity;
};

export const setupCategory = async ({ getCategory, createCategory }) => {
    const [getCategoryResponse] = await getCategory({ slug: "static" });
    const category = getCategoryResponse.data.pageBuilder.getCategory.data;
    if (category) {
        return category;
    }
    const [createCategoryResponse] = await createCategory({
        data: {
            name: "Static",
            url: "/static/",
            slug: "static",
            layout: "static"
        }
    });
    return createCategoryResponse.data.pageBuilder.createCategory.data;
};

export const createSetupForContentReview = async gqlHandler => {
    const setupReviewer = async () => {
        await gqlHandler.securityIdentity.login();

        await gqlHandler.until(
            () => gqlHandler.reviewer.listReviewersQuery({}).then(([data]) => data),
            response => response.data.apw.listReviewers.data.length === 1,
            {
                name: "Wait for listReviewer query"
            }
        );

        const [listReviewersResponse] = await gqlHandler.reviewer.listReviewersQuery({});
        const [reviewer] = listReviewersResponse.data.apw.listReviewers.data;
        return reviewer;
    };

    const setupPage = async () => {
        const category = await setupCategory({
            getCategory: gqlHandler.getCategory,
            createCategory: gqlHandler.createCategory
        });

        const [createPageResponse] = await gqlHandler.createPage({ category: category.slug });
        return createPageResponse.data.pageBuilder.createPage.data;
    };

    const setupWorkflow = async () => {
        const reviewer = await setupReviewer();
        const [createWorkflowResponse] = await gqlHandler.createWorkflowMutation({
            data: workflowMocks.createWorkflowWithThreeSteps({}, [reviewer])
        });
        return createWorkflowResponse.data.apw.createWorkflow.data;
    };

    const setup = async () => {
        const workflow = await setupWorkflow();

        await gqlHandler.until(
            () => gqlHandler.listWorkflowsQuery({}).then(([data]) => data),
            response => {
                const list = response.data.apw.listWorkflows.data;
                return list.length === 1;
            },
            {
                name: "Wait for workflow entry to be available in list query before creating page."
            }
        );

        const page = await setupPage();

        return {
            page,
            workflow
        };
    };

    return setup();
};
