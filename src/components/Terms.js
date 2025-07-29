import React from "react";

const Terms = () => (
  <div className="container">
    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff6b6b', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.07)' }}>
      利用規約
    </h2>
    <div style={{ fontSize: '1.05rem', color: '#444', lineHeight: 1.8, textAlign: 'left' }}>
      <p>この利用規約（以下「本規約」といいます）は、本サービスの利用条件を定めるものです。ご利用の前に必ずお読みください。</p>
      <h3 style={{ fontSize: '1.1rem', color: '#ff6b6b', marginTop: '18px' }}>第1条（適用）</h3>
      <p>本規約は、ユーザーと運営者との間の本サービスの利用に関わる一切の関係に適用されます。</p>
      <h3 style={{ fontSize: '1.1rem', color: '#ff6b6b', marginTop: '18px' }}>第2条（利用）</h3>
      <p>基本的にどのユーザーも本サービスを利用することができます。</p>
      <h3 style={{ fontSize: '1.1rem', color: '#ff6b6b', marginTop: '18px' }}>第3条（禁止事項）</h3>
      <ul style={{ marginLeft: '1em' }}>
        <li>法令または公序良俗に違反する行為</li>
        <li>犯罪行為に関連する行為</li>
        <li>本サービスの運営を妨害する行為</li>
        <li>他のユーザーまたは第三者に不利益、損害、不快感を与える行為</li>
        <li>不正アクセスや情報の改ざん等の行為</li>
        <li>その他、運営者が不適切と判断する行為</li>
      </ul>
      <h3 style={{ fontSize: '1.1rem', color: '#ff6b6b', marginTop: '18px' }}>第4条（本サービスの提供の停止等）</h3>
      <p>運営者は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができます。</p>
      <ul style={{ marginLeft: '1em' }}>
        <li>本サービスにかかるシステムの保守点検または更新を行う場合</li>
        <li>地震、落雷、火災、停電、天災などの不可抗力によりサービスの提供が困難となった場合</li>
        <li>その他、運営者がサービスの提供が困難と判断した場合</li>
      </ul>
      <h3 style={{ fontSize: '1.1rem', color: '#ff6b6b', marginTop: '18px' }}>第5条（免責事項）</h3>
      <ul style={{ marginLeft: '1em' }}>
        <li>運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、適合性、特定目的への適合性、セキュリティ等を含みますが、これらに限りません。）がないことを明示的にも黙示的にも保証しておりません。</li>
        <li>運営者は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。</li>
      </ul>
      <h3 style={{ fontSize: '1.1rem', color: '#ff6b6b', marginTop: '18px' }}>第6条（利用規約の変更）</h3>
      <p>運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。</p>
      <h3 style={{ fontSize: '1.1rem', color: '#ff6b6b', marginTop: '18px' }}>第7条（準拠法・裁判管轄）</h3>
      <p>本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄とします。</p>
      <p style={{ marginTop: '32px', color: '#888', fontSize: '0.95rem' }}>制定日：2025年7月30日</p>
    </div>
  </div>
);

export default Terms; 