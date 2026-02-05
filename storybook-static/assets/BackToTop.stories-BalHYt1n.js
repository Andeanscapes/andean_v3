import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{r as c}from"./index-BWu4c2F4.js";const i=()=>{const o=c.useCallback(()=>{window.scrollTo({top:0,behavior:"smooth"})},[]);return e.jsx("button",{onClick:o,className:"text-white flex justify-center items-center absolute left-1/2 -translate-x-1/2 top-0 w-[50px] h-[50px] rounded-full bg-primary-1 -translate-y-1/2 duration-300 hover:bg-primary-2",children:e.jsx("svg",{width:24,height:24,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:e.jsx("path",{d:"M19.92 15.0501L13.4 8.53014C12.63 7.76014 11.37 7.76014 10.6 8.53014L4.07996 15.0501",stroke:"currentColor",strokeWidth:"2.5",strokeMiterlimit:10,strokeLinecap:"round",strokeLinejoin:"round"})})})},n=c.memo(i);i.__docgenInfo={description:"",methods:[],displayName:"BackToTop"};const x={title:"Components/BackToTop",component:n,tags:["autodocs"],parameters:{layout:"fullscreen"}},t={render:()=>e.jsxs("div",{className:"bg-white",children:[e.jsxs("div",{className:"mx-auto max-w-3xl px-6 py-10 space-y-4",children:[e.jsx("h1",{className:"text-3xl font-semibold text-gray-900",children:"BackToTop"}),e.jsxs("p",{className:"text-gray-700",children:["Scroll down until you reach the footer area, then click the button to test"," ",e.jsx("code",{className:"font-mono",children:"window.scrollTo"}),"."]})]}),e.jsxs("div",{className:"mx-auto max-w-3xl px-6 pb-16",children:[e.jsx("div",{className:"space-y-6",children:Array.from({length:14}).map((o,a)=>e.jsxs("section",{className:"rounded-lg border border-gray-200 bg-gray-50 p-6",children:[e.jsxs("h2",{className:"text-xl font-semibold text-gray-900",children:["Section ",a+1]}),e.jsx("p",{className:"mt-2 text-gray-600",children:"Spacer content…"}),e.jsx("div",{className:"h-24"})]},a))}),e.jsxs("div",{className:"mt-16 rounded-lg overflow-hidden border border-gray-200",children:[e.jsxs("div",{className:"bg-gray-900 px-6 py-10 text-white",children:[e.jsx("h3",{className:"text-2xl font-semibold",children:"Footer area"}),e.jsx("p",{className:"mt-2 text-gray-300",children:"The BackToTop button is positioned on the top edge."})]}),e.jsx("div",{className:"relative flex justify-center bg-gray-950 py-7",children:e.jsx(n,{})})]})]})]})};var s,r,l;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: () => <div className="bg-white">
      <div className="mx-auto max-w-3xl px-6 py-10 space-y-4">
        <h1 className="text-3xl font-semibold text-gray-900">BackToTop</h1>
        <p className="text-gray-700">
          Scroll down until you reach the footer area, then click the button to test{' '}
          <code className="font-mono">window.scrollTo</code>.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-16">
        <div className="space-y-6">
          {Array.from({
          length: 14
        }).map((_, i) => <section key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-xl font-semibold text-gray-900">Section {i + 1}</h2>
              <p className="mt-2 text-gray-600">Spacer content…</p>
              <div className="h-24" />
            </section>)}
        </div>

        <div className="mt-16 rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-gray-900 px-6 py-10 text-white">
            <h3 className="text-2xl font-semibold">Footer area</h3>
            <p className="mt-2 text-gray-300">The BackToTop button is positioned on the top edge.</p>
          </div>

          <div className="relative flex justify-center bg-gray-950 py-7">
            <BackToTop />
          </div>
        </div>
      </div>
    </div>
}`,...(l=(r=t.parameters)==null?void 0:r.docs)==null?void 0:l.source}}};const p=["Default"];export{t as Default,p as __namedExportsOrder,x as default};
