import * as React from "react";
import { Logo } from "@webiny/app-admin";
import { LoginContent, LogoWrapper, Wrapper } from "./StyledComponents";

const StateContainer = ({ children }) => (
    <Wrapper>
        <LogoWrapper>
            <Logo />
        </LogoWrapper>
        <LoginContent>{children}</LoginContent>
    </Wrapper>
);

export default StateContainer;
