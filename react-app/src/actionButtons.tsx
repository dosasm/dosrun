import { Button, ButtonGroup } from "@material-ui/core";

interface ActionButtonsProps {
    baseOptions: string[];
    options: string[],
    onClick: (idx: number) => void
}

export function ActionButtons(props: ActionButtonsProps) {
    const { baseOptions, options, onClick } = props;

    const base =
        baseOptions.map(
            (val, idx) =>
                <Button
                    key={"baseOptions-" + val}
                    onClick={(e) => {
                        onClick(-1 * idx)
                    }}
                >
                    {val}
                </Button>
        )


    const actionButtons =
        options.map((val, idx) => (
            <Button
                key={"options" + val}
                onClick={(e) => {
                    onClick(idx);
                }}
            >
                {val}
            </Button>
        ));

    return <div style={{ float: "right" }}>
        <ButtonGroup
            color="default"
            variant="outlined"
            aria-label={"outlined primary button group"}
        >
            {actionButtons}
            {base}
        </ButtonGroup>
    </div>
}