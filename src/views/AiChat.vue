<template>
  <div class="ai-wrapper">
    <div class="ai-header">
      <Brain :size="22" /> <span>AI 智能助手</span>
      <span class="ai-model">DeepSeek</span>
    </div>
    <div class="ai-actions" v-if="messages.length === 0">
      <button class="action-btn" @click="quickAsk('推荐几个好用的单机游戏下载站')">🎮 推荐游戏网站</button>
      <button class="action-btn" @click="quickAsk('有哪些免费好用的在线学习网站？')">📖 推荐学习网站</button>
      <button class="action-btn" @click="quickAsk('帮我推荐几个游戏加速器')">⚡ 推荐工具网站</button>
    </div>
    <div class="ai-messages" ref="msgBox">
      <div v-for="(m,i) in messages" :key="i" class="msg-row" :class="m.role">
        <div class="msg-avatar">{{ m.role==='user'?'👤':'🤖' }}</div>
        <div class="msg-bubble" v-text="m.content"></div>
      </div>
      <div v-if="sending" class="msg-row assistant"><div class="msg-avatar">🤖</div><div class="msg-bubble typing"><span/><span/><span/></div></div>
    </div>
    <div class="ai-input">
      <input v-model="input" placeholder="问点什么..." @keyup.enter="send" :disabled="sending"/>
      <button class="send-btn" @click="send" :disabled="sending||!input.trim()"><Send :size="18"/></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Brain, Send } from '@lucide/vue'
interface Msg { role:'user'|'assistant', content:string }
const input=ref(''),sending=ref(false),messages=ref<Msg[]>([]),msgBox=ref<any>(null)
function scroll(){nextTick(()=>{if(msgBox.value)msgBox.value.scrollTop=msgBox.value.scrollHeight})}
function quickAsk(t:string){input.value=t;send()}
async function send(){const t=input.value.trim();if(!t||sending.value)return;messages.value.push({role:'user',content:t});input.value='';sending.value=true;scroll()
try{const r=await fetch('/api/front/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:t})});const j=await r.json()
if(j.code==='00000')messages.value.push({role:'assistant',content:j.data.content})
else messages.value.push({role:'assistant',content:'出错了：'+j.message})}
catch{messages.value.push({role:'assistant',content:'网络错误'})}
finally{sending.value=false;scroll()}}
</script>

<style scoped>
.ai-wrapper{display:flex;flex-direction:column;height:calc(100vh - 56px);max-width:700px;margin:0 auto}
.ai-header{display:flex;align-items:center;gap:8px;padding:14px 20px;background:#fff;border-bottom:1px solid #ebeef5;font-size:16px;font-weight:600;color:#303133;flex-shrink:0}
.ai-model{font-size:12px;color:#909399;font-weight:400;margin-left:auto}
.ai-actions{padding:24px 20px;display:flex;gap:10px;flex-wrap:wrap}
.action-btn{padding:10px 16px;border-radius:8px;border:1px solid #e0e3e9;background:#fff;font-size:13px;cursor:pointer;transition:all .15s}
.action-btn:hover{border-color:#409EFF;color:#409EFF;background:#ecf5ff}
.ai-messages{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:16px}
.msg-row{display:flex;gap:10px;align-items:flex-start}.msg-row.user{flex-direction:row-reverse}
.msg-avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.msg-row.user .msg-avatar{background:#ecf5ff}.msg-row.assistant .msg-avatar{background:#f0f2f5}
.msg-bubble{max-width:80%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.6;white-space:pre-wrap;word-break:break-word}
.msg-row.user .msg-bubble{background:#409EFF;color:#fff;border-bottom-right-radius:4px}
.msg-row.assistant .msg-bubble{background:#f0f2f5;color:#303133;border-bottom-left-radius:4px}
.typing{display:flex;gap:4px;padding:14px 18px}.typing span{width:7px;height:7px;border-radius:50%;background:#909399;animation:bounce 1.2s infinite}
.typing span:nth-child(2){animation-delay:.2s}.typing span:nth-child(3){animation-delay:.4s}
@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
.ai-input{display:flex;gap:8px;padding:12px 20px;background:#fff;border-top:1px solid #ebeef5;flex-shrink:0}
.ai-input input{flex:1;padding:10px 14px;border:1px solid #e0e3e9;border-radius:8px;font-size:14px;outline:none}
.ai-input input:focus{border-color:#409EFF}
.send-btn{width:40px;height:40px;border:none;border-radius:8px;background:#409EFF;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s}
.send-btn:hover:not(:disabled){background:#337ecc}.send-btn:disabled{background:#c0c4cc;cursor:not-allowed}
</style>
