import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import ReactNative, { View, TouchableOpacity } from 'react-native';
import { Client } from 'revolt.js';
import { currentTheme, styles } from './Theme';
import { MiniProfile } from './Profile';
import React from 'react';
import { observer } from 'mobx-react-lite';
import FastImage from 'react-native-fast-image';
const Image = FastImage;

export const app = {};
app.openProfile = (u) => {};
app.openInvite = (i) => {};
app.openBotInvite = (i) => {};
app.openServer = (s) => {};
export function setFunction(name, func) {
    app[name] = func;
}

export const defaultMaxSide = "128";

export const client = new Client();

export const Text = (props) => {
    let newProps = {...props}
    if (!props.style) newProps = Object.assign({style: {}}, newProps)
    newProps.style = Object.assign({color: currentTheme.textPrimary}, newProps.style)
    return (
        <ReactNative.Text {...newProps}>{newProps.children}</ReactNative.Text>
    )
}

export const defaultMarkdownIt = MarkdownIt({typographer: true, linkify: true}).disable([ 'image' ]);

export const INVITE_PATHS = [
    "app.revolt.chat/invite",
    "nightly.revolt.chat/invite",
    "local.revolt.chat/invite",
    "rvlt.gg",
];
export const RE_INVITE = new RegExp(
    `(?:${INVITE_PATHS.map((x) => x.split(".").join("\\.")).join(
        "|",
    )})/([A-Za-z0-9]*)`,
    "g",
);

export const BOT_INVITE_PATHS = [
    "app.revolt.chat/bot",
    "nightly.revolt.chat/bot",
    "local.revolt.chat/bot"
];
export const RE_BOT_INVITE = new RegExp(
    `(?:${BOT_INVITE_PATHS.map((x) => x.split(".").join("\\.")).join(
        "|",
    )})/([A-Za-z0-9]*)`,
    "g",
);

export const openUrl = (url) => {
    if (url.startsWith("/@")) {
        let id = url.slice(2)
        let user = client.users.get(id)
        if (user) {
            openProfile(user)
        }
        return
    }
    let match = url.match(RE_INVITE);
    if (match) {
        openInvite(match[0].split("/").pop())
        return
    }
    let botmatch = url.match(RE_BOT_INVITE);
    if (botmatch) {
        openBotInvite(botmatch[0].split("/").pop())
        return
    }
    
    Linking.openURL(url)
}

export const MarkdownView = (props) => {
    let newProps = {...props}
    if (!newProps.onLinkPress) newProps = Object.assign({onLinkPress: openUrl}, newProps)
    if (!newProps.markdownit) newProps = Object.assign({markdownit: defaultMarkdownIt}, newProps)
    if (!newProps.style) newProps = Object.assign({style: {}}, newProps)
    if (!newProps.style.body) newProps.style = Object.assign({body: {}}, newProps.style)
    newProps.style.body = Object.assign({color: currentTheme.textPrimary}, newProps.style.body)
    if (!newProps.style.paragraph) newProps.style = Object.assign({paragraph: {}}, newProps.style)
    newProps.style.paragraph = Object.assign({color: currentTheme.textPrimary, marginTop: -3, marginBottom: 2}, newProps.style.paragraph)
    if (!newProps.style.link) newProps.style = Object.assign({link: {}}, newProps.style)
    newProps.style.link = Object.assign({color: currentTheme.accentColor}, newProps.style.link)
    // if (!newProps.styles.block_quote) newProps.styles = Object.assign({blockQuote: {}}, newProps.styles)
    // newProps.styles.block_quote = Object.assign({borderRadius: 3, borderLeftWidth: 3, borderColor: currentTheme.backgroundSecondary, backgroundColor: currentTheme.blockQuoteBackground}, newProps.styles.blockQuote)
    try {
        return (
            <Markdown {...newProps}>{newProps.children}</Markdown>
        )
    } catch (e) {
        return (
            <Text>Error rendering markdown</Text>
        )
    }
}

export const GeneralAvatar = ({ attachment, size }) => {
    return (
        <View>
            {<Image source={{uri: client.generateFileURL(attachment) + "?max_side=" + defaultMaxSide}} style={{width: size || 35, height: size || 35, borderRadius: 10000}} />}
        </View>
    )
}


export const ServerList = observer(({ onServerPress }) => {
    return [...client.servers.values()].map((s) => {
        let iconURL = s.generateIconURL();
        return <TouchableOpacity onPress={
            ()=>{onServerPress(s)}
        } 
        key={s._id} 
        style={styles.serverButton}>
            {iconURL ? <Image source={{uri: iconURL + "?max_side=" + defaultMaxSide}} style={styles.serverIcon}/> : <Text>{s.name}</Text>}
        </TouchableOpacity>
    })
})

export const ChannelList = observer((props) => {
    return (
        <>
            {!props.currentServer ? <>
            <TouchableOpacity onPress={
                async ()=>{props.onChannelClick(null)}
            } 
            key={"home"} 
            style={props.currentChannel?._id == null ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                <Text>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={
                ()=>{props.onChannelClick("friends")}
            } 
            key={"friends"} 
            style={props.currentChannel == "friends" ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                <Text>Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={
                async ()=>{props.onChannelClick(await client.user.openDM())}
            } 
            key={"notes"} 
            style={props.currentChannel?.channel_type == "SavedMessages" ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                <Text>Saved Notes</Text>
            </TouchableOpacity>
            {[...client.channels.values()].filter(c => c.channel_type == "DirectMessage" || c.channel_type == "Group").map(dm => {
                if (dm.channel_type == "DirectMessage") return <TouchableOpacity onPress={
                    ()=>{props.onChannelClick(dm)}
                } onLongPress={
                    ()=>{openProfile(dm.recipient)}
                } 
                key={dm._id} 
                style={props.currentChannel?._id == dm._id ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <MiniProfile user={dm.recipient} />
                    </View>
                </TouchableOpacity>
                if (dm.channel_type == "Group") return <TouchableOpacity onPress={
                    ()=>{props.onChannelClick(dm)}
                } 
                key={dm._id} 
                style={props.currentChannel?._id == dm._id ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                    <MiniProfile channel={dm} />
                </TouchableOpacity>
            })}
            </>
            : null}
            {props.currentServer ? <>
                {props.currentServer.banner ? <Image source={{uri: props.currentServer.generateBannerURL()}} style={{width: "100%", height: 110, justifyContent: 'flex-end'}}><Text style={{margin: 10, marginTop: 13, marginBottom: 9, fontSize: 18, fontWeight: 'bold'}}>{props.currentServer.name}</Text></Image> : <Text style={{margin: 10, marginTop: 13, marginBottom: 9, fontSize: 18, fontWeight: 'bold'}}>{props.currentServer.name}</Text>}
                {(() => {
                    let processedChannels = [];
                    let res = props.currentServer.categories?.map(c => {
                        return <View key={c.id}>
                            <Text style={{marginLeft: 5, marginTop: 10, fontSize: 12, fontWeight: 'bold'}}>{c.title?.toUpperCase()}</Text>
                            {c.channels.map((cid) => {
                                processedChannels.push(cid)
                                let c = client.channels.get(cid)
                                if (c) {
                                    return <TouchableOpacity onPress={
                                        ()=>{props.onChannelClick(c)}
                                    } 
                                    key={c._id} 
                                    style={props.currentChannel?._id == c._id ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                                        {(c.generateIconURL && c.generateIconURL()) ? <Image source={{uri: c.generateIconURL() + "?max_side=" + defaultMaxSide}} style={{width: 20, height: 20, marginRight: 5}}/> : <Text>#</Text>}<Text>{c.name}</Text>
                                    </TouchableOpacity>
                                }
                            })}
                        </View>
                    })
                    return <>
                        {props.currentServer.channels.map((c) => {
                            if (c) {
                                if (!processedChannels.includes(c._id))
                                return <TouchableOpacity onPress={
                                    ()=>{props.onChannelClick(c)}
                                } 
                                key={c._id} 
                                style={props.currentChannel?._id == c._id ? [styles.channelButton, styles.channelButtonSelected] : styles.channelButton}>
                                    {(c.generateIconURL && c.generateIconURL()) ? <Image source={{uri: c.generateIconURL() + "?max_side=" + defaultMaxSide}} style={{width: 20, height: 20, marginRight: 5}}/> : <Text>#</Text>}<Text>{c.name}</Text>
                                </TouchableOpacity>
                            }
                        })}
                        {res}
                    </>
                })()}
            </> : null}
        </>
    );
})