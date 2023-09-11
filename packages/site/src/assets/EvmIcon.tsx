import { SvgHoverProps } from "../utils";

export const EvmIcon = (props: SvgHoverProps) => {
  const { hover } = props;

  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="54" height="54" rx="14.2941" fill={hover ? "#F7931A" : "#E8DDD1"} />
      <path
        d="M39.9125 24.8242L39.7832 25.2526V37.6818L39.9125 37.8077L45.8276 34.3973L39.9125 24.8242Z"
        fill="#000C49"
        fill-opacity="0.85"
      />
      <path d="M39.9114 24.8242L33.9961 34.3973L39.9114 37.8077V31.7748V24.8242Z" fill="#2E3664" />
      <path
        d="M39.9127 38.8988L39.8398 38.9855V43.413L39.9127 43.6205L45.8315 35.4902L39.9127 38.8988Z"
        fill="#000C49"
        fill-opacity="0.85"
      />
      <path d="M39.9114 43.6205V38.8988L33.9961 35.4902L39.9114 43.6205Z" fill="#2E3664" />
      <path d="M39.9102 37.8082L45.8253 34.3979L39.9102 31.7754V37.8082Z" fill="#000C49" />
      <path
        d="M33.9961 34.3979L39.9114 37.8082V31.7754L33.9961 34.3979Z"
        fill="#000C49"
        fill-opacity="0.7"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M13.1004 43.1545H10.0183C9.37062 43.1545 9.0507 43.1545 8.85564 43.0314C8.64495 42.8968 8.51621 42.6737 8.5006 42.4275C8.48888 42.2006 8.64886 41.9236 8.96878 41.3697L16.579 28.1451C16.9028 27.5835 17.0667 27.3027 17.2735 27.1989C17.4958 27.0873 17.7612 27.0873 17.9835 27.1989C18.1903 27.3027 18.3542 27.5835 18.678 28.1451L20.2425 30.8376L20.2505 30.8513C20.6002 31.4538 20.7776 31.7593 20.855 32.0799C20.9409 32.4299 20.9409 32.7992 20.855 33.1492C20.777 33.4723 20.6014 33.78 20.2464 34.3916L16.2489 41.3582L16.2386 41.376C15.8865 41.9835 15.7081 42.2913 15.4608 42.5236C15.1916 42.7775 14.8678 42.962 14.5128 43.0661C14.1889 43.1545 13.8261 43.1545 13.1004 43.1545ZM20.8839 43.1545H25.3003C25.9518 43.1545 26.2796 43.1545 26.4748 43.0277C26.6854 42.893 26.818 42.666 26.8299 42.42C26.8411 42.2004 26.6846 41.9342 26.3779 41.4125C26.3674 41.3947 26.3568 41.3767 26.346 41.3583L24.1338 37.6273L24.1086 37.5853C23.7978 37.067 23.6409 36.8053 23.4393 36.7042C23.2171 36.5926 22.9555 36.5926 22.7332 36.7042C22.5303 36.808 22.3665 37.0811 22.0426 37.6311L19.8383 41.3621L19.8307 41.375C19.5081 41.9241 19.3468 42.1985 19.3584 42.4237C19.374 42.6699 19.5028 42.8968 19.7134 43.0314C19.9046 43.1545 20.2324 43.1545 20.8839 43.1545Z"
        fill={hover ? "#000C49" : "#ED643D"}
      />
      <path
        d="M29.9771 13.793C29.675 13.6203 29.2866 13.6203 28.9413 13.793L26.5244 15.2172L24.8843 16.1235L22.5106 17.5478C22.2085 17.7204 21.82 17.7204 21.4747 17.5478L19.6189 16.4257C19.3168 16.253 19.101 15.9077 19.101 15.5193V13.3614C19.101 13.0161 19.2736 12.6709 19.6189 12.4551L21.4747 11.3761C21.7769 11.2035 22.1653 11.2035 22.5106 11.3761L24.3664 12.4982C24.6685 12.6709 24.8843 13.0161 24.8843 13.4046V14.8288L26.5244 13.8793V12.4119C26.5244 12.0666 26.3517 11.7214 26.0065 11.5056L22.5537 9.47713C22.2516 9.3045 21.8632 9.3045 21.5179 9.47713L17.9788 11.5487C17.6336 11.7214 17.4609 12.0666 17.4609 12.4119V16.4688C17.4609 16.8141 17.6336 17.1593 17.9788 17.3751L21.4747 19.4036C21.7769 19.5762 22.1653 19.5762 22.5106 19.4036L24.8843 18.0225L26.5244 17.073L28.8981 15.692C29.2003 15.5193 29.5887 15.5193 29.934 15.692L31.7898 16.7709C32.0919 16.9436 32.3077 17.2888 32.3077 17.6772V19.8352C32.3077 20.1804 32.1351 20.5257 31.7898 20.7415L29.9771 21.8205C29.675 21.9931 29.2866 21.9931 28.9413 21.8205L27.0855 20.7415C26.7833 20.5689 26.5675 20.2236 26.5675 19.8352V18.4541L24.9275 19.4036V20.8278C24.9275 21.1731 25.1001 21.5184 25.4454 21.7341L28.9413 23.7626C29.2434 23.9352 29.6319 23.9352 29.9771 23.7626L33.473 21.7341C33.7751 21.5615 33.9909 21.2162 33.9909 20.8278V16.7278C33.9909 16.3825 33.8183 16.0372 33.473 15.8214L29.9771 13.793Z"
        fill={hover ? "#000C49" : "#819DFE"}
      />
      <rect
        x="0.5"
        y="0.5"
        width="53"
        height="53"
        rx="13.7941"
        stroke="black"
        stroke-opacity="0.1"
      />
    </svg>
  );
};