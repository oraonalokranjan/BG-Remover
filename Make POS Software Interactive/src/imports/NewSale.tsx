import imgCancel from "figma:asset/2b06a0cae3bfc8c10c44d5cb91c2c7a502d50551.png";

function Frame1() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[4px] items-center leading-[1.2] not-italic relative shrink-0">
      <p className="relative shrink-0 text-[#0e101a] text-[14px] whitespace-nowrap">Start a New Sale?</p>
      <p className="relative shrink-0 text-[#727681] text-[12px] text-center w-[264px]">All items currently in the cart will be removed. Do you want to continue?</p>
    </div>
  );
}

function AddButton() {
  return (
    <button className="bg-white content-stretch cursor-pointer flex items-center justify-center px-[20px] py-[12px] relative rounded-[4px] shrink-0 w-[122px]" data-name="Add Button">
      <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-none not-italic relative shrink-0 text-[#727681] text-[14px] text-left whitespace-nowrap">Cancel</p>
    </button>
  );
}

function AddButton1() {
  return (
    <div className="bg-[#1f7fff] content-stretch flex items-center justify-center px-[20px] py-[12px] relative rounded-[4px] shrink-0 w-[122px]" data-name="Add Button">
      <div aria-hidden="true" className="absolute border-[#0084ff] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-none not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">Confirm</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
      <AddButton />
      <AddButton1 />
    </div>
  );
}

export default function NewSale() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[16px] items-center justify-center p-[24px] relative rounded-[8px] size-full" data-name="New Sale">
      <div aria-hidden="true" className="absolute border border-[#eaeaea] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="relative shrink-0 size-[48px]" data-name="Cancel">
        <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgCancel} />
      </div>
      <Frame1 />
      <Frame />
    </div>
  );
}