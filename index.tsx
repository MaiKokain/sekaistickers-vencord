/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addChatBarButton, ChatBarButton } from "@api/ChatButtons";
import { Flex } from "@components/Flex";
import { Devs } from "@utils/constants";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, ModalSize, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import { findByProps } from "@webpack";
import { Button, ChannelStore, Forms, React, Slider, Switch, Text, TextInput, UploadHandler } from "@webpack/common";

import { characters } from "./characters.json";
import Canvas from "./Components/Canvas";
import CharSelectModal from "./Components/Picker";
import { kanadeSvg } from "./kanade.svg";

const generateTestCharBar: ChatBarButton = () => {
    return (
        <ChatBarButton onClick={() => openModal(props => <Modal modalProps={props} />)} tooltip="Sekai Stickers">
            {kanadeSvg()}
        </ChatBarButton>
    );
};


function Modal({ modalProps }: { modalProps: ModalProps; }) {
    const [text, setText] = React.useState<string>("奏でーかわいい");
    const [character, setChracter] = React.useState<number>(49);
    const [fontSize, setFontSize] = React.useState<number>(30);
    const [rotate, setRotate] = React.useState<number>(0);
    const [curve, setCurve] = React.useState<boolean>(false);
    const [isImgLoaded, setImgLoaded] = React.useState<boolean>(false);
    const [position, setPosition] = React.useState<{ x: number, y: number; }>({ x: 0, y: 0 });
    const [spaceSize, setSpaceSize] = React.useState<number>(18);
    let canvast!: HTMLCanvasElement;
    const img = new Image();

    React.useEffect(() => {
        setImgLoaded(false);
        setPosition({ x: img.width / 2, y: img.height / 2 });
    }, [character]);
    img.src = "https://st.ayaka.one/img/" + characters[character].img;
    img.crossOrigin = "anonymous";

    img.onload = () => { setImgLoaded(true); };
    const angle = (Math.PI * text.length) / 7;

    const draw = ctx => {
        ctx.canvas.width = 296;
        ctx.canvas.height = 256;

        if (isImgLoaded && document.fonts.check("12px YurukaStd")) {
            const hRatio = ctx.canvas.width / img.width;
            const vRatio = ctx.canvas.height / img.height;
            const ratio = Math.min(hRatio, vRatio);
            const centerShiftX = (ctx.canvas.width - img.width * ratio) / 2;
            const centerShiftY = (ctx.canvas.height - img.height * ratio) / 2;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(
                img,
                0,
                0,
                img.width,
                img.height,
                centerShiftX,
                centerShiftY,
                img.width * ratio,
                img.height * ratio
            );
            ctx.font = `${fontSize}px YurukaStd, SSFangTangTi`;
            ctx.lineWidth = 9;
            ctx.save();
            ctx.translate(position.x, position.y);
            ctx.rotate(rotate / 10);
            ctx.textAlign = "center";
            ctx.strokeStyle = "white";
            ctx.fillStyle = characters[character].color;
            if (curve) {
                for (let i = 0; i < text.length; i++) {
                    ctx.rotate(angle / text.length / 2.5);
                    ctx.save();
                    ctx.translate(0, -1 * fontSize * 3.5);
                    ctx.strokeText(text[i], 0, 0);
                    ctx.fillText(text[i], 0, 0);
                    ctx.restore();
                }
            } else {
                let k = 0;
                for (let i = 0; i < text.length; i++) {
                    ctx.strokeText(text[i], 0, k);
                    ctx.fillText(text[i], 0, k);
                    k += spaceSize;
                }
                ctx.restore();
            }
            canvast = ctx.canvas;
        }
    };
    return (
        <ModalRoot {...modalProps} size={ModalSize.DYNAMIC}>
            <ModalHeader>
                <Text variant="heading-lg/bold" style={{ flexGrow: 1 }}>Sekai Stickers</Text>
                <ModalCloseButton onClick={modalProps.onClose} ></ModalCloseButton>
            </ModalHeader>
            <ModalContent>
                <Flex flexDirection="row" style={{ paddingTop: 12 }}>
                    <div style={{ marginRight: 30 }}>
                        <Canvas draw={draw} id="SekaiCard_Canvas" />
                        <Forms.FormTitle>Text Y Pos</Forms.FormTitle>
                        <Slider minValue={0} maxValue={256} asValueChanges={va => { va = Math.round(va); setPosition({ x: position.x, y: curve ? 256 + fontSize * 3 - va : 256 - va }); }} initialValue={curve ? 256 - position.y + fontSize * 3 : 256 - position.y} orientation={"vertical"} onValueRender={va => String(Math.round(va))} />
                        <Forms.FormTitle>Text XZ Pos</Forms.FormTitle>
                        <Slider minValue={0} maxValue={296} asValueChanges={va => { va = Math.round(va); setPosition({ y: position.y, x: va }); }} initialValue={position.x} orientation={"horizontal"} onValueRender={(v: number) => String(Math.round(v))} />
                    </div>
                    <div style={{ marginRight: 10, width: "30vw" }}>
                        <Forms.FormTitle>Text</Forms.FormTitle>
                        <TextInput onChange={(e: string) => { setText(e); }} content="奏でーかわいい" placeholder="奏でーかわいい" />
                        <Forms.FormTitle>Rotation</Forms.FormTitle>
                        <Slider minValue={-10} maxValue={10} asValueChanges={val => setRotate(Math.round(val))} initialValue={rotate} keyboardStep={0.2} orientation={"horizontal"} onValueRender={(v: number) => String(Math.round(v))} />
                        <Forms.FormTitle>Font Size</Forms.FormTitle>
                        <Slider minValue={10} asValueChanges={val => setFontSize(Math.round(val))} maxValue={100} initialValue={fontSize} keyboardStep={1} orientation={"horizontal"} onValueRender={(v: number) => String(Math.round(v))} />
                        <Forms.FormTitle>Spacing</Forms.FormTitle>
                        <Slider minValue={18} maxValue={100} initialValue={spaceSize} asValueChanges={e => setSpaceSize(Math.round(e))} onValueRender={e => String(Math.round(e))} />
                        <Switch value={curve} onChange={val => setCurve(val)}>Enable curve</Switch>
                        <Button onClick={() => openModal(props => <CharSelectModal modalProps={props} setCharacter={setChracter} />)}>Switch Character</Button>
                    </div>
                </Flex>
            </ModalContent>
            <ModalFooter>
                <Flex flexDirection="row" style={{ gap: 12 }}>
                    <Button onClick={() => {
                        modalProps.onClose();
                        canvast.toBlob(blob => {
                            const file = new File([blob as Blob], `${characters[character].character}-sekai_cards.png`, { type: "image/png" });
                            UploadHandler.promptToUpload([file], ChannelStore.getChannel(findByProps("getChannelId").getChannelId()), 0);
                        });
                    }}>Upload as Attachment</Button>
                    {/* <Button onClick={() => {
                        modalProps.onClose();
                        canvast.toBlob(blob => {
                            const file = new File([blob as Blob], `${characters[character].character}-sekai_cards.png`, { type: "image/png" });
                            UploadHandler.promptToUpload([file], ChannelStore.getChannel(findByProps("getChannelId").getChannelId()), 0);
                            sendMessage(findByProps("getChannelId").getChannelId(), { content: "\\w+" }, true);
                        });
                    }}>Send to Channel</Button> */}
                </Flex>
            </ModalFooter>
        </ModalRoot>
    );
}

export default definePlugin({
    name: "Sekai Stickers",
    description: "Sekai Stickers built in discord originally from github.com/TheOriginalAyaka",
    authors: [Devs.MaiKokain],
    start: () => {
        const fonts = [{ name: "YurukaStd", url: "https://raw.githubusercontent.com/TheOriginalAyaka/sekai-stickers/main/src/fonts/YurukaStd.woff2" }, { name: "SSFangTangTi", url: "https://raw.githubusercontent.com/TheOriginalAyaka/sekai-stickers/main/src/fonts/ShangShouFangTangTi.woff2" }];
        fonts.map(n => {
            new FontFace(n.name, `url(${n.url})`).load().then(
                font => { document.fonts.add(font); },
                err => { console.log(err); }
            );
        });
        addChatBarButton("SekaiStickers", generateTestCharBar);
    },
});


// const importApngJs = makeLazy(async () => {
//     const exports = {}
//     const winProxy = new Proxy(window, { set: (_, k, v) => exports[k] = v });
//     Function("self", await fetch("https://cdnjs.cloudflare.com/ajax/libs/apng-canvas/2.1.1/apng-canvas.min.js").then(r => r.text()))(winProxy);
//     return exports.APNG;
//   });


//   // once needed
//   const apng = await importApngJs();

// fetch("https://raw.githubusercontent.com/TheOriginalAyaka/sekai-stickers/main/public/img/Haruka/Haruka_01.png")
//   .then((response) => response.body)
//   .then((rb) => {
//     const reader = rb.getReader();

//     return new ReadableStream({
//       start(controller) {
//         // The following function handles each data chunk
//         function push() {
//           // "done" is a Boolean and value a "Uint8Array"
//           reader.read().then(({ done, value }) => {
//             // If there is no more data to read
//             if (done) {
//               console.log("done", done);
//               controller.close();
//               return;
//             }
//             // Get the data and send it to the browser via the controller
//             controller.enqueue(value);
//             // Check chunks by logging to the console
//             push();
//           });
//         }

//         push();
//       },
//     });
//   })
//   .then((stream) =>
//     // Respond with our stream
//     new Response(stream, { headers: { "Content-Type": "image/png" } }).blob(),
//   )
//   .then((result) => {
//     // Do things with result
//     console.log(result.text());
//   });