import React from "react";
import { css } from "emotion";
import { IconButton } from "@webiny/ui/Button";
import { useRouter } from "@webiny/react-router";
import { ReactComponent as BackIcon } from "~/admin/assets/icons/round-arrow-back_24dp.svg";

const backStyles = css({
    marginLeft: -10
});

const BackButton = React.memo(() => {
    const router = useRouter();

    return (
        <IconButton
            data-testid="apw-content-review-editor-back-button"
            className={backStyles}
            onClick={() => router.history.push(`/apw/content-reviews`)}
            icon={<BackIcon />}
        />
    );
});

BackButton.displayName = "BackButton";

export default BackButton;