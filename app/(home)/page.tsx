import Link from 'next/link';

const courses = [
  ['01', '编程地基', 'C/C++、内存、指针、编译、STL 与调试', '/01.卷一-编程地基/00.本卷导读'],
  ['02', '系统与底层', '进程、ELF、链接、系统调用与 ARM64', '/02.卷二-系统与底层/00.本卷导读'],
  ['03', 'Android 原生与构建', 'NDK、adb、root、交叉编译与工程组织', '/03.卷三-Android原生与构建/00.本卷导读'],
  ['04', '3D 数学', '向量、矩阵、旋转、相机与投影', '/04.卷四-3D数学/00.本卷导读'],
  ['05', '图形与界面', 'Vulkan、ImGui、SurfaceFlinger 与输入链路', '/05.卷五-图形与界面/00.本卷导读'],
  ['06', '跨进程内存', '读写、maps、ELF 符号、缓存与并发', '/06.卷六-跨进程内存/00.本卷导读'],
  ['07', '引擎数据模型', 'Actor、Component、FName、骨骼与数据结构', '/07.卷七-引擎数据模型/00.本卷导读'],
  ['08', '物理与可见性', '碰撞体、BVH、Embree、光线投射与网格', '/08.卷八-物理与可见性/00.本卷导读'],
] as const;

const extras = [
  ['深挖专题', '把容易卡住的边界问题继续往下挖。', '/09.深挖专题/00.深挖索引', '专题'],
  ['英文词汇', '按真实项目源码语境整理的技术英语词汇。', '/10.英文词汇/00.词频词汇总览', '词汇'],
  ['附录', '速查表、排错手册、源码地图、练习与总索引。', '/11.附录/00.附录A-命令速查表', '参考'],
] as const;

export default function HomePage() {
  return (
    <main className="home-shell">
      <section className="hero-wrap">
        <div className="hero-kicker">PROGRAMMING KNOWLEDGE BASE · 152 LESSONS</div>
        <h1>编程教程全集</h1>
        <p>从编程地基到 Android、系统底层、3D 数学、图形与引擎数据模型。按一条可以真正动手跑通的路线，把散落的知识拼成完整工程能力。</p>
        <div className="hero-actions">
          <Link className="primary-action" href="/00.开始之前/00.开始之前">开始阅读 <span>→</span></Link>
          <Link className="secondary-action" href="/01.卷一-编程地基/00.本卷导读">浏览全部教程</Link>
          <a className="secondary-action" href="https://github.com/Rainy-C/tutorial" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
        <div className="hero-stats" aria-label="站点统计">
          <div><strong>152</strong><span>篇教程</span></div>
          <div><strong>8</strong><span>个主卷</span></div>
          <div><strong>100</strong><span>章主线课程</span></div>
          <div><strong>3</strong><span>组扩展资料</span></div>
        </div>
      </section>

      <section className="section-block" aria-labelledby="course-title">
        <div className="section-heading">
          <div><span>COURSE MAP</span><h2 id="course-title">八卷主线</h2></div>
          <p>顺着编号走，也可以按你当前要解决的问题直接切入。</p>
        </div>
        <div className="course-grid">
          {courses.map(([num, title, desc, href]) => (
            <Link className="course-card" href={href} key={num}>
              <span className="course-num">{num}</span>
              <div><h3>{title}</h3><p>{desc}</p></div>
              <span className="course-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="route-panel" aria-labelledby="route-title">
        <div className="route-copy"><span>LEARNING ROUTE</span><h2 id="route-title">学习路线</h2><p>先让代码跑起来，再理解它为什么这样跑。数学、图形、跨进程与引擎数据模型随后逐层接上。</p></div>
        <ol className="route-list">
          <li><b>01</b><span>编程与工具链</span></li>
          <li><b>02</b><span>系统与 Android</span></li>
          <li><b>03</b><span>3D 数学与图形</span></li>
          <li><b>04</b><span>内存、引擎与可见性</span></li>
        </ol>
      </section>

      <section className="section-block" aria-labelledby="extra-title">
        <div className="section-heading"><div><span>REFERENCE</span><h2 id="extra-title">继续深挖</h2></div><p>主线之外的专题、词汇和工程参考资料。</p></div>
        <div className="extra-grid">
          {extras.map(([title, desc, href, tag]) => (
            <Link className="extra-card" href={href} key={title}>
              <span>{tag}</span><h3>{title}</h3><p>{desc}</p><b>打开 →</b>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
