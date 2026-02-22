const POLICY_PAGES = {
    privacy: () => `
            <div style="max-width: 900px; margin: 0 auto; padding: 20px;">
                <h1 style="margin: 30px 0 20px; color: var(--accent-primary);">개인정보처리방침</h1>
                <div style="line-height: 1.8; color: var(--text-primary);">
                    <p><strong>1. 수집하는 정보</strong></p>
                    <p>사케를 보다 (Sake View)는 다음과 같은 개인정보를 수집합니다:</p>
                    <ul style="margin-left: 20px;">
                        <li>이메일 주소 (회원가입 시)</li>
                        <li>사케 테이스팅 노트 데이터</li>
                        <li>사진 파일 (선택사항)</li>
                    </ul>

                    <p style="margin-top: 20px;"><strong>2. 정보 이용 목적</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>사용자 인증 및 계정 관리</li>
                        <li>테이스팅 노트 저장 및 관리</li>
                        <li>서비스 개선 및 품질 향상</li>
                        <li>통계 분석 및 리포트 생성</li>
                        <li>사용자 행동 분석을 통한 서비스 최적화</li>
                        <li>법적 의무 이행</li>
                    </ul>

                    <p style="margin-top: 20px;"><strong>2-1. 데이터 분석 및 통계</strong></p>
                    <p>사용자가 입력한 테이스팅 노트 데이터는 다음과 같이 분석 및 통계 작성에 사용될 수 있습니다:</p>
                    <ul style="margin-left: 20px;">
                        <li>사케 이름별 인기도 통계</li>
                        <li>사케 평가 데이터 분석 (색감, 투명도, 향, 맛 등의 평균값)</li>
                        <li>지역별/양조장별 통계</li>
                        <li>시간대별 사케 소비 추세</li>
                        <li>사용자 수 및 활동 통계</li>
                    </ul>
                    <p style="margin-left: 20px; font-size: 0.95em; color: var(--text-secondary);">이러한 통계는 개인을 식별할 수 없는 익명화된 형태로 생성되며, 서비스 개선 및 인사이트 제공 목적으로만 사용됩니다. 누적 데이터 300건 이상 시 공개 통계로 제공될 수 있습니다.</p>

                    <p style="margin-top: 20px;"><strong>2-2. 테이스팅 노트 공개</strong></p>
                    <p>사용자가 작성한 테이스팅 노트(평점, 감상평, 사진 등)는 작성자를 식별할 수 없는 익명 형태로 서비스 내 커뮤니티, 통계 페이지 등에 공개될 수 있습니다. 공개 시 이메일 주소, 이름 등 개인을 특정할 수 있는 정보는 표시되지 않습니다.</p>

                    <p style="margin-top: 20px;"><strong>3. 정보 보호</strong></p>
                    <p>사용자의 개인정보는 Supabase의 보안 서버에 암호화되어 저장됩니다. 우리는 업계 표준의 보안 조치를 취하고 있습니다.</p>

                    <p style="margin-top: 20px;"><strong>4. 정보 공유</strong></p>
                    <p>개인정보는 제3자와 공유되지 않습니다. 단, 법적 요청이나 서비스 제공자(Supabase, Cloudflare)와의 협력이 필요한 경우는 예외입니다.</p>

                    <p style="margin-top: 20px;"><strong>5. 사용자 권리</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>자신의 정보 열람 요청</li>
                        <li>정보 수정 또는 삭제 요청</li>
                        <li>서비스 탈퇴</li>
                    </ul>

                    <p style="margin-top: 20px;"><strong>6. 쿠키 및 추적</strong></p>
                    <p>사케를 보다는 필수 기능을 위해 로컬 스토리지를 사용합니다. 광고 및 분석 목적의 추적은 제한적으로만 사용됩니다.</p>

                    <p style="margin-top: 20px;"><strong>7. 정책 변경</strong></p>
                    <p>본 개인정보처리방침은 사전 고지 없이 변경될 수 있습니다. 변경 사항은 이 페이지에 게시됩니다.</p>

                    <p style="margin-top: 20px;"><strong>8. 연락처</strong></p>
                    <p>개인정보에 관한 문의는 sakeview@sakeview.com으로 연락주세요.</p>

                    <p style="margin-top: 30px; color: var(--text-muted); font-size: 0.9em;">마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}</p>
                </div>
            </div>
    `,

    terms: () => `
            <div style="max-width: 900px; margin: 0 auto; padding: 20px;">
                <h1 style="margin: 30px 0 20px; color: var(--accent-primary);">이용약관</h1>
                <div style="line-height: 1.8; color: var(--text-primary);">
                    <p><strong>1. 서비스 개요</strong></p>
                    <p>사케를 보다 (Sake View)는 사용자가 사케 테이스팅 경험을 기록하고 관리할 수 있는 웹 애플리케이션입니다.</p>

                    <p style="margin-top: 20px;"><strong>2. 이용 약관 동의</strong></p>
                    <p>본 서비스를 이용함으로써 사용자는 본 약관에 동의하는 것으로 간주됩니다.</p>

                    <p style="margin-top: 20px;"><strong>3. 사용자의 의무</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>정확한 정보 제공</li>
                        <li>계정 정보의 비밀 유지</li>
                        <li>법률을 위반하는 활동 금지</li>
                        <li>타인의 권리 침해 금지</li>
                    </ul>

                    <p style="margin-top: 20px;"><strong>4. 지적재산권</strong></p>
                    <p>사케를 보다 및 그 콘텐츠는 저작권으로 보호됩니다. 사용자가 입력한 테이스팅 노트는 사용자의 소유입니다. 단, 사용자는 본 서비스를 이용함으로써 작성한 테이스팅 노트가 익명화된 형태로 서비스 내에 공개되는 것에 동의합니다.</p>

                    <p style="margin-top: 20px;"><strong>5. 제한 사항</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>불법 콘텐츠 업로드 금지</li>
                        <li>서비스 방해 행위 금지</li>
                        <li>자동화된 접근 금지</li>
                        <li>개인정보 수집 금지</li>
                    </ul>

                    <p style="margin-top: 20px;"><strong>6. 광고</strong></p>
                    <p>본 서비스는 Google AdSense를 통해 광고를 표시합니다. 광고는 사용자 경험을 방해하지 않도록 설계되었습니다.</p>

                    <p style="margin-top: 20px;"><strong>7. 서비스 변경 및 중단</strong></p>
                    <p>당사는 사전 공지 후 서비스를 변경하거나 중단할 수 있습니다.</p>

                    <p style="margin-top: 20px;"><strong>8. 책임 제한</strong></p>
                    <p>본 서비스는 "있는 그대로" 제공됩니다. 당사는 서비스의 중단, 오류 또는 데이터 손실에 대해 책임을 제한합니다.</p>

                    <p style="margin-top: 20px;"><strong>9. 약관 변경</strong></p>
                    <p>본 약관은 사전 고지 없이 변경될 수 있습니다. 변경 사항은 이 페이지에 게시됩니다.</p>

                    <p style="margin-top: 20px;"><strong>10. 준거법</strong></p>
                    <p>본 약관은 대한민국 법률에 따라 해석되고 관할됩니다.</p>

                    <p style="margin-top: 20px;"><strong>11. 문의</strong></p>
                    <p>약관에 관한 문의는 sakeview@sakeview.com으로 연락주세요.</p>

                    <p style="margin-top: 30px; color: var(--text-muted); font-size: 0.9em;">마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}</p>
                </div>
            </div>
    `,

    about: () => `
            <div style="max-width: 900px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 50px;">
                    <h1 style="font-size: 2.8em; margin: 20px 0; color: var(--accent-primary); font-family: 'Cormorant Garamond', serif;">사케를 보다</h1>
                    <p style="font-size: 1.1em; color: var(--text-muted); letter-spacing: 3px;">SAKE VIEW</p>
                    <div style="width: 60px; height: 2px; background: linear-gradient(90deg, var(--accent-gold), var(--accent-rose)); margin: 20px auto;"></div>
                </div>

                <div style="line-height: 1.9; color: var(--text-primary);">
                    <!-- 서비스 소개 -->
                    <div style="background: var(--bg-tertiary); padding: 40px; border-radius: 20px; margin-bottom: 40px; border-left: 4px solid var(--accent-gold);">
                        <h2 style="color: var(--accent-gold); margin-bottom: 20px; font-family: 'Cormorant Garamond', serif; font-size: 1.6em;">서비스 소개</h2>
                        <p style="font-size: 1.05em; margin-bottom: 15px;">
                            <strong>사케를 보다(Sake View)</strong>는 사케를 사랑하는 모든 분들을 위한 테이스팅 노트 서비스입니다.
                            어렵고 복잡한 테이스팅 용어 대신, 버튼 하나로 간편하게 사케의 특징을 기록할 수 있도록 만들었습니다.
                        </p>
                        <p style="font-size: 1.05em;">
                            향, 맛, 바디감, 여운, 페어링까지 — 카테고리별로 준비된 태그를 탭하기만 하면 나만의 테이스팅 노트가 완성됩니다.
                            시간이 지나도 그 순간의 감동을 다시 떠올릴 수 있도록 도와드립니다.
                        </p>
                    </div>

                    <!-- 운영 목적 -->
                    <h2 style="color: var(--accent-primary); margin-top: 40px; margin-bottom: 25px; font-family: 'Cormorant Garamond', serif; font-size: 1.5em;">운영 목적</h2>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px;">
                        <div style="background: var(--card-bg); border: 1px solid var(--border-light); padding: 25px; border-radius: 16px;">
                            <div style="font-size: 2em; margin-bottom: 15px;">📝</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">간편한 기록</h3>
                            <p style="color: var(--text-secondary); font-size: 0.95em;">복잡한 용어 없이 버튼 탭만으로 향, 맛, 바디감, 여운을 기록할 수 있습니다.</p>
                        </div>
                        <div style="background: var(--card-bg); border: 1px solid var(--border-light); padding: 25px; border-radius: 16px;">
                            <div style="font-size: 2em; margin-bottom: 15px;">🎓</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">사케 문화 전파</h3>
                            <p style="color: var(--text-secondary); font-size: 0.95em;">사케 가이드, 용어사전, FAQ를 통해 초보자도 쉽게 사케에 대해 배울 수 있습니다.</p>
                        </div>
                        <div style="background: var(--card-bg); border: 1px solid var(--border-light); padding: 25px; border-radius: 16px;">
                            <div style="font-size: 2em; margin-bottom: 15px;">🌏</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">한국 사케 커뮤니티</h3>
                            <p style="color: var(--text-secondary); font-size: 0.95em;">한국어로 된 사케 정보와 테이스팅 도구를 제공하여 국내 사케 문화 발전에 기여합니다.</p>
                        </div>
                    </div>

                    <!-- 주요 기능 -->
                    <h2 style="color: var(--accent-primary); margin-top: 40px; margin-bottom: 25px; font-family: 'Cormorant Garamond', serif; font-size: 1.5em;">주요 기능</h2>

                    <div style="background: var(--card-bg); border-left: 4px solid var(--accent-gold); padding: 25px; margin-bottom: 20px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-gold); margin-bottom: 12px;">🍶 버튼식 테이스팅 노트</h3>
                        <p>향, 맛, 바디감, 여운, 페어링 등 카테고리별로 준비된 태그를 탭하면 테이스팅 노트가 완성됩니다. 메인 태그를 지정해 가장 인상적인 특징을 강조할 수도 있습니다.</p>
                    </div>

                    <div style="background: var(--card-bg); border-left: 4px solid var(--accent-rose); padding: 25px; margin-bottom: 20px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-rose); margin-bottom: 12px;">📸 사진 기록</h3>
                        <p>사케 병, 라벨, 색상을 사진으로 남겨 시각적인 기록도 함께 보관하세요. 나중에 다시 찾을 때 큰 도움이 됩니다.</p>
                    </div>

                    <div style="background: var(--card-bg); border-left: 4px solid var(--accent-gold); padding: 25px; margin-bottom: 20px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-gold); margin-bottom: 12px;">☁️ 클라우드 동기화</h3>
                        <p>클라우드 서버에 데이터가 저장되어, 어느 기기에서든 내 테이스팅 노트에 접근할 수 있습니다.</p>
                    </div>

                    <div style="background: var(--card-bg); border-left: 4px solid var(--accent-rose); padding: 25px; margin-bottom: 20px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-rose); margin-bottom: 12px;">👥 커뮤니티</h3>
                        <p>다른 사케 애호가들의 테이스팅 노트를 구경하고, 나의 기록도 공유할 수 있습니다.</p>
                    </div>

                    <!-- 팀 소개 -->
                    <h2 style="color: var(--accent-primary); margin-top: 50px; margin-bottom: 25px; font-family: 'Cormorant Garamond', serif; font-size: 1.5em;">팀 소개</h2>

                    <div style="background: var(--bg-tertiary); padding: 35px; border-radius: 20px; margin-bottom: 40px;">
                        <div style="display: flex; align-items: center; gap: 25px; flex-wrap: wrap;">
                            <div style="width: 100px; height: 100px; background: linear-gradient(135deg, var(--accent-gold), var(--accent-rose)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5em;">🍶</div>
                            <div style="flex: 1; min-width: 250px;">
                                <h3 style="color: var(--accent-primary); margin-bottom: 8px;">Sake View Team</h3>
                                <p style="color: var(--text-muted); font-size: 0.9em; margin-bottom: 12px;">사케 애호가 & 개발자</p>
                                <p style="color: var(--text-secondary);">
                                    사케를 보다는 사케를 진심으로 사랑하는 개발자가 만들었습니다.
                                    마신 사케를 쉽고 간편하게 기록하고, 그 경험을 다른 사케 애호가들과 나누고 싶어
                                    이 서비스를 개발하게 되었습니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- 기술 스택 -->
                    <h2 style="color: var(--accent-primary); margin-top: 40px; margin-bottom: 25px; font-family: 'Cormorant Garamond', serif; font-size: 1.5em;">기술 스택</h2>
                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <div><strong style="color: var(--accent-gold);">Frontend:</strong> HTML5, CSS3, Vanilla JavaScript</div>
                            <div><strong style="color: var(--accent-gold);">Backend:</strong> Supabase (PostgreSQL)</div>
                            <div><strong style="color: var(--accent-gold);">Hosting:</strong> Cloudflare Pages</div>
                            <div><strong style="color: var(--accent-gold);">Authentication:</strong> Supabase Auth</div>
                        </div>
                    </div>

                    <!-- 연혁 -->
                    <h2 style="color: var(--accent-primary); margin-top: 40px; margin-bottom: 25px; font-family: 'Cormorant Garamond', serif; font-size: 1.5em;">서비스 연혁</h2>
                    <div style="border-left: 2px solid var(--accent-gold); padding-left: 25px; margin-left: 10px;">
                        <div style="margin-bottom: 20px; position: relative;">
                            <div style="position: absolute; left: -33px; width: 16px; height: 16px; background: var(--accent-gold); border-radius: 50%;"></div>
                            <strong style="color: var(--accent-primary);">2025년 10월</strong>
                            <p style="color: var(--text-secondary); margin-top: 5px;">사케를 보다 서비스 기획 시작</p>
                        </div>
                        <div style="position: relative;">
                            <div style="position: absolute; left: -33px; width: 16px; height: 16px; background: var(--accent-gold); border-radius: 50%;"></div>
                            <strong style="color: var(--accent-primary);">2026년 1월</strong>
                            <p style="color: var(--text-secondary); margin-top: 5px;">베타 버전 출시 및 테스트 중</p>
                        </div>
                    </div>

                    <p style="margin-top: 50px; color: var(--text-muted); font-size: 0.9em; text-align: center;">
                        © 2026 Sake View. All rights reserved.<br>
                        마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}
                    </p>
                </div>
            </div>
    `,

    contact: () => `
            <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 50px;">
                    <h1 style="font-size: 2.5em; margin: 20px 0; color: var(--accent-primary); font-family: 'Cormorant Garamond', serif;">문의하기</h1>
                    <p style="color: var(--text-muted);">궁금한 점이나 제안이 있으시면 언제든 연락해주세요</p>
                    <div style="width: 60px; height: 2px; background: linear-gradient(90deg, var(--accent-gold), var(--accent-rose)); margin: 20px auto;"></div>
                </div>

                <div style="line-height: 1.9; color: var(--text-primary);">
                    <!-- 문의 방법 -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; margin-bottom: 50px;">
                        <div style="background: var(--bg-tertiary); padding: 35px; border-radius: 20px; text-align: center;">
                            <div style="font-size: 2.5em; margin-bottom: 20px;">📧</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 12px;">이메일 문의</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 15px;">일반 문의, 제안, 피드백</p>
                            <a href="mailto:sakeview@sakeview.com" style="color: var(--accent-gold); font-weight: 600; text-decoration: none;">sakeview@sakeview.com</a>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 35px; border-radius: 20px; text-align: center;">
                            <div style="font-size: 2.5em; margin-bottom: 20px;">🐛</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 12px;">버그 신고</h3>
                            <p style="color: var(--text-secondary); margin-bottom: 15px;">오류 발견 시 알려주세요</p>
                            <a href="mailto:sakeview@sakeview.com?subject=[버그신고]" style="color: var(--accent-gold); font-weight: 600; text-decoration: none;">버그 신고하기</a>
                        </div>
                    </div>

                    <!-- 문의 유형별 안내 -->
                    <h2 style="color: var(--accent-primary); margin-bottom: 25px; font-family: 'Cormorant Garamond', serif; font-size: 1.5em;">문의 유형별 안내</h2>

                    <div style="background: var(--card-bg); border-left: 4px solid var(--accent-gold); padding: 25px; margin-bottom: 20px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-gold); margin-bottom: 12px;">💡 기능 제안</h3>
                        <p style="color: var(--text-secondary);">새로운 기능이나 개선 아이디어가 있으시면 알려주세요. 사용자분들의 의견을 반영하여 더 나은 서비스를 만들어 나가겠습니다.</p>
                    </div>

                    <div style="background: var(--card-bg); border-left: 4px solid var(--accent-rose); padding: 25px; margin-bottom: 20px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-rose); margin-bottom: 12px;">❓ 사용 방법 문의</h3>
                        <p style="color: var(--text-secondary);">서비스 이용 중 어려운 점이 있으시면 문의해주세요. FAQ 페이지에서 자주 묻는 질문도 확인하실 수 있습니다.</p>
                    </div>

                    <div style="background: var(--card-bg); border-left: 4px solid var(--accent-gold); padding: 25px; margin-bottom: 20px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-gold); margin-bottom: 12px;">🤝 제휴 문의</h3>
                        <p style="color: var(--text-secondary);">사케 관련 업체, 이자카야, 수입사 등의 제휴 및 협업 문의를 환영합니다.</p>
                    </div>

                    <div style="background: var(--card-bg); border-left: 4px solid var(--accent-rose); padding: 25px; margin-bottom: 20px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-rose); margin-bottom: 12px;">🔐 계정 관련</h3>
                        <p style="color: var(--text-secondary);">계정 삭제, 비밀번호 재설정, 데이터 삭제 요청 등 계정 관련 문의는 가입 시 사용한 이메일 주소를 함께 알려주세요.</p>
                    </div>

                    <!-- 응답 안내 -->
                    <div style="background: var(--bg-tertiary); padding: 30px; border-radius: 20px; margin-top: 40px;">
                        <h3 style="color: var(--accent-primary); margin-bottom: 15px;">📬 문의 처리 안내</h3>
                        <ul style="color: var(--text-secondary); margin-left: 20px;">
                            <li style="margin-bottom: 10px;">문의 접수 후 <strong>영업일 기준 1-3일 이내</strong> 답변드리겠습니다.</li>
                            <li style="margin-bottom: 10px;">문의 시 <strong>이메일 제목에 [문의 유형]</strong>을 적어주시면 더 빠른 처리가 가능합니다.</li>
                            <li style="margin-bottom: 10px;">버그 신고 시 <strong>화면 캡처나 오류 메시지</strong>를 함께 보내주시면 도움이 됩니다.</li>
                            <li>개인정보 관련 문의는 본인 확인 절차가 필요할 수 있습니다.</li>
                        </ul>
                    </div>

                    <p style="margin-top: 50px; color: var(--text-muted); font-size: 0.9em; text-align: center;">
                        여러분의 소중한 의견이 사케를 보다를 더 좋게 만듭니다.<br>
                        언제든 편하게 연락해주세요!
                    </p>
                </div>
            </div>
    `,

    guide: () => `
            <div style="max-width: 1000px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 50px;">
                    <h1 style="font-size: 2.5em; margin: 20px 0; color: var(--accent-primary); font-family: 'Cormorant Garamond', serif;">사케 가이드</h1>
                    <p style="color: var(--text-muted);">사케의 기초부터 테이스팅까지, 당신의 사케 여정을 위한 모든 것</p>
                    <div style="width: 60px; height: 2px; background: linear-gradient(90deg, var(--accent-gold), var(--accent-rose)); margin: 20px auto;"></div>
                </div>

                <div style="line-height: 1.9; color: var(--text-primary);">
                    <!-- 목차 -->
                    <div style="background: var(--bg-tertiary); padding: 30px; border-radius: 20px; margin-bottom: 50px;">
                        <h3 style="color: var(--accent-gold); margin-bottom: 20px;">📖 목차</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <div style="color: var(--text-secondary);">1. 사케란 무엇인가?</div>
                            <div style="color: var(--text-secondary);">2. 사케의 역사</div>
                            <div style="color: var(--text-secondary);">3. 사케 종류 완벽 가이드</div>
                            <div style="color: var(--text-secondary);">4. 정미보합(精米歩合)이란?</div>
                            <div style="color: var(--text-secondary);">5. 사케 테이스팅 방법</div>
                            <div style="color: var(--text-secondary);">6. 온도별 음용법</div>
                            <div style="color: var(--text-secondary);">7. 사케와 음식 페어링</div>
                            <div style="color: var(--text-secondary);">8. 보관 및 관리법</div>
                        </div>
                    </div>

                    <!-- 1. 사케란 무엇인가 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 40px; border: 1px solid var(--border-light);">
                        <h2 style="color: var(--accent-primary); margin-bottom: 20px; font-family: 'Cormorant Garamond', serif;">1. 사케란 무엇인가?</h2>
                        <p style="margin-bottom: 15px;">
                            <strong>사케(日本酒, にほんしゅ)</strong>는 일본의 전통 양조주로, 쌀을 주원료로 하여 누룩(koji, 麴)과 효모를 사용해 발효시켜 만듭니다.
                            영어권에서는 "Sake" 또는 "Japanese Rice Wine"으로 불리지만, 와인과는 제조 방식이 완전히 다릅니다.
                        </p>
                        <p style="margin-bottom: 15px;">
                            와인은 포도의 당분을 직접 발효시키지만, 사케는 쌀의 전분을 누룩이 당분으로 전환하고 이를 효모가 발효시키는
                            <strong>병행복발효(並行複発酵)</strong>라는 독특한 방식을 사용합니다. 이 과정이 사케 특유의 복잡하고 섬세한 풍미를 만들어냅니다.
                        </p>
                        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px; margin-top: 20px;">
                            <h4 style="color: var(--accent-gold); margin-bottom: 10px;">🍶 사케의 주요 원료</h4>
                            <ul style="margin-left: 20px; color: var(--text-secondary);">
                                <li><strong>쌀(米):</strong> 주요 원료. 양조용 쌀(酒米)이 주로 사용됨</li>
                                <li><strong>물(水):</strong> 사케의 80%를 차지. 지역마다 물의 특성이 다름</li>
                                <li><strong>누룩(麴):</strong> 쌀의 전분을 당분으로 바꾸는 역할</li>
                                <li><strong>효모(酵母):</strong> 당분을 알코올로 발효시킴</li>
                            </ul>
                        </div>
                    </div>

                    <!-- 2. 사케의 역사 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 40px; border: 1px solid var(--border-light);">
                        <h2 style="color: var(--accent-primary); margin-bottom: 20px; font-family: 'Cormorant Garamond', serif;">2. 사케의 역사</h2>
                        <div style="border-left: 3px solid var(--accent-gold); padding-left: 25px;">
                            <div style="margin-bottom: 25px;">
                                <strong style="color: var(--accent-gold);">기원전 300년경</strong>
                                <p style="color: var(--text-secondary); margin-top: 5px;">벼농사와 함께 원시적인 형태의 사케 양조 시작</p>
                            </div>
                            <div style="margin-bottom: 25px;">
                                <strong style="color: var(--accent-gold);">7-8세기 (나라/헤이안 시대)</strong>
                                <p style="color: var(--text-secondary); margin-top: 5px;">조정과 사찰에서 본격적인 사케 제조. 누룩 기술 발전</p>
                            </div>
                            <div style="margin-bottom: 25px;">
                                <strong style="color: var(--accent-gold);">16세기 (전국시대)</strong>
                                <p style="color: var(--text-secondary); margin-top: 5px;">대량 생산 기술 발전. 이 시기 나다(灘), 후시미(伏見) 등 유명 산지 형성</p>
                            </div>
                            <div style="margin-bottom: 25px;">
                                <strong style="color: var(--accent-gold);">메이지 시대 (1868-1912)</strong>
                                <p style="color: var(--text-secondary); margin-top: 5px;">서양 과학 기술 도입으로 양조 기술 현대화</p>
                            </div>
                            <div>
                                <strong style="color: var(--accent-gold);">현대</strong>
                                <p style="color: var(--text-secondary); margin-top: 5px;">긴조, 다이긴조 등 프리미엄 사케 등장. 세계적으로 인정받는 일본의 문화유산</p>
                            </div>
                        </div>
                    </div>

                    <!-- 3. 사케 종류 -->
                    <h2 style="color: var(--accent-primary); margin: 50px 0 30px; font-family: 'Cormorant Garamond', serif; font-size: 1.8em;">3. 사케 종류 완벽 가이드</h2>

                    <div style="background: var(--card-bg); border-left: 5px solid var(--accent-gold); padding: 25px; margin-bottom: 25px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-gold); margin-bottom: 15px;">🌾 준마이(純米) - Pure Rice Sake</h3>
                        <p style="margin-bottom: 10px;"><strong>정미보합:</strong> 규정 없음 (보통 60-70%)</p>
                        <p style="margin-bottom: 10px;"><strong>특징:</strong> 쌀, 물, 누룩만 사용. 양조 알코올 무첨가</p>
                        <p style="margin-bottom: 10px;"><strong>맛:</strong> 진하고 풍부한 쌀의 맛과 우마미. 산미도 적당히 있음</p>
                        <p><strong>추천 온도:</strong> 상온 ~ 데워서 (15-50°C)</p>
                    </div>

                    <div style="background: var(--card-bg); border-left: 5px solid var(--accent-rose); padding: 25px; margin-bottom: 25px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-rose); margin-bottom: 15px;">✨ 혼조조(本醸造) - Honjozo</h3>
                        <p style="margin-bottom: 10px;"><strong>정미보합:</strong> 70% 이하</p>
                        <p style="margin-bottom: 10px;"><strong>특징:</strong> 소량의 양조 알코올 첨가로 향을 끌어올림</p>
                        <p style="margin-bottom: 10px;"><strong>맛:</strong> 가볍고 깔끔한 맛. 부드러운 목넘김</p>
                        <p><strong>추천 온도:</strong> 차게 ~ 데워서 (5-45°C)</p>
                    </div>

                    <div style="background: var(--card-bg); border-left: 5px solid var(--accent-gold); padding: 25px; margin-bottom: 25px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-gold); margin-bottom: 15px;">💎 긴조(吟醸) - Ginjo</h3>
                        <p style="margin-bottom: 10px;"><strong>정미보합:</strong> 60% 이하</p>
                        <p style="margin-bottom: 10px;"><strong>특징:</strong> 저온에서 천천히 발효. 화려한 과일향(긴조카)</p>
                        <p style="margin-bottom: 10px;"><strong>맛:</strong> 섬세하고 우아한 향. 가볍고 깔끔한 맛</p>
                        <p><strong>추천 온도:</strong> 차게 (5-15°C)</p>
                    </div>

                    <div style="background: var(--card-bg); border-left: 5px solid var(--accent-rose); padding: 25px; margin-bottom: 25px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-rose); margin-bottom: 15px;">👑 다이긴조(大吟醸) - Daiginjo</h3>
                        <p style="margin-bottom: 10px;"><strong>정미보합:</strong> 50% 이하</p>
                        <p style="margin-bottom: 10px;"><strong>특징:</strong> 가장 정교하게 도정된 쌀 사용. 프리미엄 등급</p>
                        <p style="margin-bottom: 10px;"><strong>맛:</strong> 매우 섬세하고 복잡한 향. 실크처럼 부드러운 맛</p>
                        <p><strong>추천 온도:</strong> 차게 (5-10°C)</p>
                    </div>

                    <div style="background: var(--card-bg); border-left: 5px solid var(--accent-gold); padding: 25px; margin-bottom: 25px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-gold); margin-bottom: 15px;">🌸 토쿠베츠(特別) - Special Grade</h3>
                        <p style="margin-bottom: 10px;"><strong>종류:</strong> 토쿠베츠 준마이, 토쿠베츠 혼조조</p>
                        <p style="margin-bottom: 10px;"><strong>특징:</strong> 특별한 제조법이나 재료 사용 (정미보합 60% 이하 또는 특수 공정)</p>
                        <p><strong>맛:</strong> 각 양조장의 개성이 드러나는 독특한 풍미</p>
                    </div>

                    <div style="background: var(--card-bg); border-left: 5px solid var(--accent-rose); padding: 25px; margin-bottom: 40px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-rose); margin-bottom: 15px;">☁️ 니고리자케(濁り酒) - Cloudy Sake</h3>
                        <p style="margin-bottom: 10px;"><strong>특징:</strong> 여과를 거치지 않아 뿌옇고 우유빛깔</p>
                        <p style="margin-bottom: 10px;"><strong>맛:</strong> 크리미하고 달콤한 맛. 쌀의 풍미가 진함</p>
                        <p><strong>추천:</strong> 디저트 사케로 인기. 차게 마시면 좋음</p>
                    </div>

                    <!-- 4. 정미보합 -->
                    <div style="background: var(--bg-tertiary); padding: 35px; border-radius: 20px; margin-bottom: 40px;">
                        <h2 style="color: var(--accent-primary); margin-bottom: 20px; font-family: 'Cormorant Garamond', serif;">4. 정미보합(精米歩合)이란?</h2>
                        <p style="margin-bottom: 20px;">
                            정미보합은 <strong>쌀을 얼마나 깎았는지</strong>를 나타내는 수치입니다. 숫자가 낮을수록 더 많이 깎은 것입니다.
                        </p>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; text-align: center;">
                            <div style="background: var(--card-bg); padding: 20px; border-radius: 12px;">
                                <div style="font-size: 1.8em; color: var(--accent-gold); margin-bottom: 10px;">70%</div>
                                <div style="color: var(--text-secondary); font-size: 0.9em;">혼조조 기준<br>30% 제거</div>
                            </div>
                            <div style="background: var(--card-bg); padding: 20px; border-radius: 12px;">
                                <div style="font-size: 1.8em; color: var(--accent-gold); margin-bottom: 10px;">60%</div>
                                <div style="color: var(--text-secondary); font-size: 0.9em;">긴조 기준<br>40% 제거</div>
                            </div>
                            <div style="background: var(--card-bg); padding: 20px; border-radius: 12px;">
                                <div style="font-size: 1.8em; color: var(--accent-gold); margin-bottom: 10px;">50%</div>
                                <div style="color: var(--text-secondary); font-size: 0.9em;">다이긴조 기준<br>50% 제거</div>
                            </div>
                            <div style="background: var(--card-bg); padding: 20px; border-radius: 12px;">
                                <div style="font-size: 1.8em; color: var(--accent-gold); margin-bottom: 10px;">23%</div>
                                <div style="color: var(--text-secondary); font-size: 0.9em;">닷사이 23<br>77% 제거!</div>
                            </div>
                        </div>
                        <p style="margin-top: 20px; color: var(--text-secondary); font-size: 0.95em;">
                            💡 쌀의 바깥 부분에는 단백질과 지방이 많아 잡미를 유발합니다. 많이 깎을수록 깔끔하고 섬세한 맛이 납니다.
                        </p>
                    </div>

                    <!-- 5. 테이스팅 방법 -->
                    <h2 style="color: var(--accent-primary); margin: 50px 0 30px; font-family: 'Cormorant Garamond', serif; font-size: 1.8em;">5. 사케 테이스팅 방법</h2>

                    <div style="background: var(--card-bg); padding: 30px; border-radius: 20px; margin-bottom: 25px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-gold); margin-bottom: 15px;">🔍 1단계: 시각 (色 - 이로)</h3>
                        <p style="margin-bottom: 10px;">흰색 배경에 잔을 비춰 색을 관찰합니다.</p>
                        <ul style="margin-left: 20px; color: var(--text-secondary);">
                            <li>투명도: 맑은지, 뿌연지</li>
                            <li>색조: 무색, 옅은 황색, 황금색 등</li>
                            <li>점도: 잔을 돌렸을 때 다리(legs)가 생기는지</li>
                        </ul>
                    </div>

                    <div style="background: var(--card-bg); padding: 30px; border-radius: 20px; margin-bottom: 25px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-gold); margin-bottom: 15px;">👃 2단계: 후각 (香 - 카오리)</h3>
                        <p style="margin-bottom: 10px;">잔을 가볍게 흔든 후 향을 맡습니다.</p>
                        <ul style="margin-left: 20px; color: var(--text-secondary);">
                            <li><strong>우와다치카(上立ち香):</strong> 잔에서 올라오는 첫 향</li>
                            <li><strong>후쿠미카(含み香):</strong> 입에 머금었을 때 느껴지는 향</li>
                            <li>과일향, 꽃향, 쌀향, 유제품향 등을 구분</li>
                        </ul>
                    </div>

                    <div style="background: var(--card-bg); padding: 30px; border-radius: 20px; margin-bottom: 25px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-gold); margin-bottom: 15px;">👅 3단계: 미각 (味 - 아지)</h3>
                        <p style="margin-bottom: 10px;">소량을 입에 머금고 혀 전체로 느껴봅니다.</p>
                        <ul style="margin-left: 20px; color: var(--text-secondary);">
                            <li><strong>아마미(甘味):</strong> 단맛</li>
                            <li><strong>산미(酸味):</strong> 신맛</li>
                            <li><strong>우마미(旨味):</strong> 감칠맛</li>
                            <li><strong>니가미(苦味):</strong> 쓴맛</li>
                            <li><strong>시부미(渋味):</strong> 떫은맛</li>
                        </ul>
                    </div>

                    <div style="background: var(--card-bg); padding: 30px; border-radius: 20px; margin-bottom: 40px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-gold); margin-bottom: 15px;">✨ 4단계: 여운 (余韻 - 요인)</h3>
                        <p style="margin-bottom: 10px;">삼킨 후 입안에 남는 맛과 향을 평가합니다.</p>
                        <ul style="margin-left: 20px; color: var(--text-secondary);">
                            <li>여운의 길이: 짧은지, 긴지</li>
                            <li>여운의 질: 깔끔한지, 복잡한지</li>
                            <li>전체적인 균형과 조화</li>
                        </ul>
                    </div>

                    <!-- 6. 온도별 음용법 -->
                    <h2 style="color: var(--accent-primary); margin: 50px 0 30px; font-family: 'Cormorant Garamond', serif; font-size: 1.8em;">6. 온도별 음용법</h2>

                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 16px; overflow: hidden;">
                            <thead>
                                <tr style="background: var(--accent-primary); color: white;">
                                    <th style="padding: 15px; text-align: left;">온도</th>
                                    <th style="padding: 15px; text-align: left;">일본어 명칭</th>
                                    <th style="padding: 15px; text-align: left;">특징</th>
                                    <th style="padding: 15px; text-align: left;">추천 사케</th>
                                </tr>
                            </thead>
                            <tbody style="color: var(--text-secondary);">
                                <tr style="border-bottom: 1px solid var(--border-light);">
                                    <td style="padding: 15px;">5°C</td>
                                    <td style="padding: 15px;">유키비에(雪冷え)</td>
                                    <td style="padding: 15px;">눈처럼 차가움</td>
                                    <td style="padding: 15px;">다이긴조, 스파클링</td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-light);">
                                    <td style="padding: 15px;">10°C</td>
                                    <td style="padding: 15px;">하나비에(花冷え)</td>
                                    <td style="padding: 15px;">꽃처럼 시원함</td>
                                    <td style="padding: 15px;">긴조, 신선한 사케</td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-light);">
                                    <td style="padding: 15px;">15°C</td>
                                    <td style="padding: 15px;">스즈비에(涼冷え)</td>
                                    <td style="padding: 15px;">시원함</td>
                                    <td style="padding: 15px;">대부분의 사케</td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-light);">
                                    <td style="padding: 15px;">20°C</td>
                                    <td style="padding: 15px;">히야(冷や)</td>
                                    <td style="padding: 15px;">상온</td>
                                    <td style="padding: 15px;">준마이, 혼조조</td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-light);">
                                    <td style="padding: 15px;">35°C</td>
                                    <td style="padding: 15px;">히토하다칸(人肌燗)</td>
                                    <td style="padding: 15px;">체온 정도</td>
                                    <td style="padding: 15px;">준마이</td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-light);">
                                    <td style="padding: 15px;">45°C</td>
                                    <td style="padding: 15px;">조칸(上燗)</td>
                                    <td style="padding: 15px;">따뜻함</td>
                                    <td style="padding: 15px;">혼조조, 준마이</td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px;">55°C</td>
                                    <td style="padding: 15px;">아츠칸(熱燗)</td>
                                    <td style="padding: 15px;">뜨거움</td>
                                    <td style="padding: 15px;">진한 맛의 사케</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- 7. 페어링 -->
                    <h2 style="color: var(--accent-primary); margin: 50px 0 30px; font-family: 'Cormorant Garamond', serif; font-size: 1.8em;">7. 사케와 음식 페어링</h2>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; margin-bottom: 40px;">
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 15px;">🍣 다이긴조 + 회/초밥</h3>
                            <p style="color: var(--text-secondary);">섬세한 다이긴조는 신선한 해산물의 맛을 해치지 않으면서 깔끔하게 마무리해줍니다.</p>
                        </div>
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 15px;">🍶 준마이 + 튀김/구이</h3>
                            <p style="color: var(--text-secondary);">풍부한 우마미의 준마이는 기름진 요리와 환상의 조화를 이룹니다.</p>
                        </div>
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 15px;">🧀 긴조 + 치즈</h3>
                            <p style="color: var(--text-secondary);">과일향이 풍부한 긴조는 크리미한 치즈와 의외의 좋은 조합입니다.</p>
                        </div>
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 15px;">🥘 아츠칸 + 나베/전골</h3>
                            <p style="color: var(--text-secondary);">따뜻하게 데운 사케는 겨울철 전골 요리와 몸을 따뜻하게 해줍니다.</p>
                        </div>
                    </div>

                    <!-- 8. 보관법 -->
                    <div style="background: var(--bg-tertiary); padding: 35px; border-radius: 20px; margin-bottom: 40px;">
                        <h2 style="color: var(--accent-primary); margin-bottom: 20px; font-family: 'Cormorant Garamond', serif;">8. 보관 및 관리법</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                            <div>
                                <h4 style="color: var(--accent-gold); margin-bottom: 10px;">🌡️ 온도</h4>
                                <p style="color: var(--text-secondary);">냉장 보관(5-10°C)이 기본. 특히 긴조, 나마자케는 필수</p>
                            </div>
                            <div>
                                <h4 style="color: var(--accent-gold); margin-bottom: 10px;">☀️ 빛</h4>
                                <p style="color: var(--text-secondary);">직사광선 피하기. 자외선은 사케를 변질시킴</p>
                            </div>
                            <div>
                                <h4 style="color: var(--accent-gold); margin-bottom: 10px;">📦 자세</h4>
                                <p style="color: var(--text-secondary);">세워서 보관. 마개와 접촉 면적 최소화</p>
                            </div>
                            <div>
                                <h4 style="color: var(--accent-gold); margin-bottom: 10px;">⏰ 기간</h4>
                                <p style="color: var(--text-secondary);">개봉 후 1-2주 내 소비. 미개봉은 1년 이내</p>
                            </div>
                        </div>
                    </div>

                    <div style="background: linear-gradient(135deg, var(--accent-gold), var(--accent-rose)); padding: 30px; border-radius: 20px; text-align: center; color: white;">
                        <h3 style="margin-bottom: 15px;">🍶 사케 여정을 기록해보세요</h3>
                        <p style="opacity: 0.9;">사케를 보다와 함께 당신만의 테이스팅 노트를 작성하고, 특별한 순간을 기록하세요.</p>
                    </div>

                    <p style="margin-top: 50px; color: var(--text-muted); font-size: 0.9em; text-align: center;">
                        마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}
                    </p>
                </div>
            </div>
    `,

    glossary: () => `
            <div style="max-width: 900px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 50px;">
                    <h1 style="font-size: 2.5em; margin: 20px 0; color: var(--accent-primary); font-family: 'Cormorant Garamond', serif;">사케 용어사전</h1>
                    <p style="color: var(--text-muted);">사케를 이해하기 위한 필수 용어 모음</p>
                    <div style="width: 60px; height: 2px; background: linear-gradient(90deg, var(--accent-gold), var(--accent-rose)); margin: 20px auto;"></div>
                </div>

                <div style="line-height: 1.9; color: var(--text-primary);">
                    <!-- 가나다순 정렬 -->
                    <div style="display: grid; gap: 20px;">

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">긴조 (吟醸, ぎんじょう)</h3>
                            <p style="color: var(--text-secondary);">정미보합 60% 이하로 도정한 쌀을 사용하여 저온에서 천천히 발효시킨 사케. 화려한 과일향(긴조카)이 특징.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">나마자케 (生酒, なまざけ)</h3>
                            <p style="color: var(--text-secondary);">가열 살균(히이레)을 하지 않은 생사케. 신선하고 프레시한 맛이 특징이며 냉장 보관 필수.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">니고리자케 (濁り酒, にごりざけ)</h3>
                            <p style="color: var(--text-secondary);">여과를 거치지 않아 쌀 찌꺼기가 남아있는 뿌연 사케. 크리미하고 달콤한 맛.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">니혼슈도 (日本酒度, にほんしゅど)</h3>
                            <p style="color: var(--text-secondary);">사케의 단맛/드라이함을 나타내는 수치. +가 클수록 드라이, -가 클수록 달콤. SMV(Sake Meter Value)라고도 함.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">다이긴조 (大吟醸, だいぎんじょう)</h3>
                            <p style="color: var(--text-secondary);">정미보합 50% 이하의 최고급 사케. 매우 섬세하고 복잡한 향미를 가짐.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">사카마이 (酒米, さかまい)</h3>
                            <p style="color: var(--text-secondary);">사케 양조 전용 쌀. 야마다니시키, 고햐쿠만고쿠, 미야마니시키 등이 유명.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">산도 (酸度, さんど)</h3>
                            <p style="color: var(--text-secondary);">사케의 산미 정도를 나타내는 수치. 높을수록 신맛이 강하고 드라이한 느낌.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">세이마이부아이 (精米歩合, せいまいぶあい)</h3>
                            <p style="color: var(--text-secondary);">정미보합. 쌀을 도정한 후 남은 비율. 60%면 40%를 깎아낸 것.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">야마다니시키 (山田錦, やまだにしき)</h3>
                            <p style="color: var(--text-secondary);">'사케 쌀의 왕'으로 불리는 최고급 양조 쌀. 효고현이 주산지.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">우마미 (旨味, うまみ)</h3>
                            <p style="color: var(--text-secondary);">제5의 맛인 감칠맛. 사케에서는 아미노산에서 오는 깊은 맛을 의미.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">준마이 (純米, じゅんまい)</h3>
                            <p style="color: var(--text-secondary);">쌀, 누룩, 물만으로 만든 순수 쌀 사케. 양조 알코올 무첨가.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">칸 (燗, かん)</h3>
                            <p style="color: var(--text-secondary);">사케를 데워서 마시는 것. 온도에 따라 누루칸, 조칸, 아츠칸 등으로 구분.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">코지 (麹, こうじ)</h3>
                            <p style="color: var(--text-secondary);">누룩. 쌀에 곰팡이균(Aspergillus oryzae)을 배양한 것. 전분을 당으로 분해하는 역할.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">토지 (杜氏, とうじ)</h3>
                            <p style="color: var(--text-secondary);">사케 양조장의 수석 양조 기술자. 양조의 모든 과정을 총괄.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">히이레 (火入れ, ひいれ)</h3>
                            <p style="color: var(--text-secondary);">저온 살균 과정. 보통 60-65°C로 가열하여 효소와 박테리아를 비활성화.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">혼조조 (本醸造, ほんじょうぞう)</h3>
                            <p style="color: var(--text-secondary);">정미보합 70% 이하의 쌀을 사용하고 소량의 양조 알코올을 첨가한 사케.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">아라바시리 (荒走り, あらばしり)</h3>
                            <p style="color: var(--text-secondary);">모로미를 압착할 때 처음 흘러나오는 사케. 신선하고 거친 맛이 특징. 한정 출시되는 경우가 많음.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">나카도리 (中取り, なかどり)</h3>
                            <p style="color: var(--text-secondary);">압착 중간에 나오는 가장 밸런스 좋은 부분의 사케. 가장 품질이 좋다고 평가됨.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">세메 (責め, せめ)</h3>
                            <p style="color: var(--text-secondary);">압착 마지막에 힘을 주어 짜낸 사케. 맛이 진하고 쓴맛이 있을 수 있음.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">신푸 (辛口, からくち)</h3>
                            <p style="color: var(--text-secondary);">드라이한 맛. 니혼슈도가 +1 이상인 사케를 가리킴.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">아마쿠치 (甘口, あまくち)</h3>
                            <p style="color: var(--text-secondary);">단맛이 나는 사케. 니혼슈도가 -1 이하인 사케를 가리킴.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">후루자케 (古酒, こしゅ)</h3>
                            <p style="color: var(--text-secondary);">오래 숙성시킨 사케. 보통 3년 이상 숙성. 호박색으로 변하고 셰리 같은 복잡한 풍미 발현.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">겐슈 (原酒, げんしゅ)</h3>
                            <p style="color: var(--text-secondary);">가수(물 첨가)를 하지 않은 원액 사케. 알코올 도수가 18-20%로 높음.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">무로카 (無濾過, むろか)</h3>
                            <p style="color: var(--text-secondary);">여과를 하지 않은 사케. 본래의 색과 맛이 그대로 남아 있음.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">시보리타테 (搾りたて, しぼりたて)</h3>
                            <p style="color: var(--text-secondary);">갓 짜낸 신선한 사케. 주로 겨울에 출시되며 프레시한 맛이 특징.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">히야오로시 (ひやおろし)</h3>
                            <p style="color: var(--text-secondary);">봄에 1차 히이레 후 여름 동안 숙성, 가을에 2차 히이레 없이 출하되는 사케. 가을의 풍물.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">신슈 (新酒, しんしゅ)</h3>
                            <p style="color: var(--text-secondary);">그 해에 새로 만든 사케. 보통 12월~3월 사이에 출시. 신선하고 상큼한 맛.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">쿠라 (蔵, くら)</h3>
                            <p style="color: var(--text-secondary);">사케 양조장. '사카구라(酒蔵)'라고도 함. 일본 전국에 약 1,400개 존재.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">스파클링 사케 (発泡酒)</h3>
                            <p style="color: var(--text-secondary);">탄산이 들어간 사케. 자연 발효 또는 인공 탄산 주입. 상쾌하고 가볍게 즐길 수 있음.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">도쿠리 (徳利, とっくり)</h3>
                            <p style="color: var(--text-secondary);">사케를 담는 목이 좁은 도자기 병. 데워서 서빙할 때 주로 사용.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-gold);">
                            <h3 style="color: var(--accent-gold); margin-bottom: 8px;">긴조카 (吟醸香, ぎんじょうか)</h3>
                            <p style="color: var(--text-secondary);">긴조급 사케에서 나는 특유의 과일향. 사과, 바나나, 멜론 등의 에스테르 향.</p>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border-left: 4px solid var(--accent-rose);">
                            <h3 style="color: var(--accent-rose); margin-bottom: 8px;">키키자케 (利き酒, ききざけ)</h3>
                            <p style="color: var(--text-secondary);">사케 테이스팅. 전문적으로 사케의 품질을 평가하는 것. '기키자케시'는 테이스팅 전문가.</p>
                        </div>

                    </div>

                    <p style="margin-top: 50px; color: var(--text-muted); font-size: 0.9em; text-align: center;">
                        총 30개 이상의 용어가 수록되어 있습니다.<br>
                        마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}
                    </p>
                </div>
            </div>
    `,

    howto: () => `
            <div style="max-width: 900px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 50px;">
                    <h1 style="font-size: 2.5em; margin: 20px 0; color: var(--accent-primary); font-family: 'Cormorant Garamond', serif;">서비스 사용법</h1>
                    <p style="color: var(--text-muted);">사케를 보다를 200% 활용하는 방법</p>
                    <div style="width: 60px; height: 2px; background: linear-gradient(90deg, var(--accent-gold), var(--accent-rose)); margin: 20px auto;"></div>
                </div>

                <div style="line-height: 1.9; color: var(--text-primary);">
                    <!-- 시작하기 -->
                    <div style="background: var(--bg-tertiary); padding: 35px; border-radius: 20px; margin-bottom: 40px;">
                        <h2 style="color: var(--accent-gold); margin-bottom: 20px;">🚀 시작하기</h2>
                        <div style="display: grid; gap: 20px;">
                            <div style="display: flex; gap: 20px; align-items: flex-start;">
                                <div style="min-width: 50px; height: 50px; background: var(--accent-gold); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">1</div>
                                <div>
                                    <h3 style="color: var(--accent-primary); margin-bottom: 8px;">회원가입</h3>
                                    <p style="color: var(--text-secondary);">이메일과 비밀번호만으로 간단하게 가입할 수 있습니다. Google 계정으로 소셜 로그인도 가능합니다.</p>
                                </div>
                            </div>
                            <div style="display: flex; gap: 20px; align-items: flex-start;">
                                <div style="min-width: 50px; height: 50px; background: var(--accent-gold); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">2</div>
                                <div>
                                    <h3 style="color: var(--accent-primary); margin-bottom: 8px;">로그인</h3>
                                    <p style="color: var(--text-secondary);">가입한 계정으로 로그인하면 모든 기능을 사용할 수 있습니다. 로그인 상태는 브라우저를 닫아도 유지됩니다.</p>
                                </div>
                            </div>
                            <div style="display: flex; gap: 20px; align-items: flex-start;">
                                <div style="min-width: 50px; height: 50px; background: var(--accent-gold); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">3</div>
                                <div>
                                    <h3 style="color: var(--accent-primary); margin-bottom: 8px;">첫 테이스팅 노트 작성</h3>
                                    <p style="color: var(--text-secondary);">'새 노트' 탭에서 사케 정보를 입력하고 테이스팅 평가를 시작하세요!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 테이스팅 노트 작성하기 -->
                    <h2 style="color: var(--accent-primary); margin-bottom: 25px; font-family: 'Cormorant Garamond', serif; font-size: 1.5em;">✍️ 테이스팅 노트 작성하기</h2>

                    <div style="background: var(--card-bg); border-left: 4px solid var(--accent-gold); padding: 25px; margin-bottom: 20px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-gold); margin-bottom: 12px;">📋 기본 정보 입력</h3>
                        <ul style="margin-left: 20px; color: var(--text-secondary);">
                            <li><strong>사케 이름:</strong> DB에서 검색하거나 직접 입력 (예: 닷사이 23, 쿠보타 만주)</li>
                            <li><strong>날짜:</strong> 테이스팅 날짜 선택</li>
                            <li><strong>사진:</strong> 라벨, 병, 잔에 담긴 모습 촬영 (선택사항)</li>
                        </ul>
                    </div>

                    <div style="background: var(--card-bg); border-left: 4px solid var(--accent-rose); padding: 25px; margin-bottom: 20px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-rose); margin-bottom: 12px;">🏷️ 테이스팅 태그 선택</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 10px;">카테고리별 탭을 전환하며 느낀 특징을 태그로 탭하세요.</p>
                        <ul style="margin-left: 20px; color: var(--text-secondary);">
                            <li><strong>향:</strong> 과일, 꽃, 곡물, 유제품 등 느껴지는 향 선택</li>
                            <li><strong>맛:</strong> 단맛, 산미, 감칠맛, 쓴맛 등 맛의 특징</li>
                            <li><strong>바디감:</strong> 라이트부터 풀바디까지, 질감과 무게감</li>
                            <li><strong>여운:</strong> 피니시의 길이와 인상</li>
                            <li><strong>페어링:</strong> 함께 먹은 음식과 상황</li>
                        </ul>
                    </div>

                    <div style="background: var(--card-bg); border-left: 4px solid var(--accent-gold); padding: 25px; margin-bottom: 20px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-gold); margin-bottom: 12px;">★ 메인 태그 지정</h3>
                        <p style="color: var(--text-secondary);">이미 선택한 태그를 한 번 더 탭하면 해당 카테고리의 <strong>메인 태그</strong>로 지정됩니다. 메인 태그는 금색으로 강조되어 가장 인상적인 특징을 한눈에 보여줍니다.</p>
                    </div>

                    <div style="background: var(--card-bg); border-left: 4px solid var(--accent-rose); padding: 25px; margin-bottom: 40px; border-radius: 0 16px 16px 0;">
                        <h3 style="color: var(--accent-rose); margin-bottom: 12px;">💯 종합 평점 & 감상평</h3>
                        <ul style="margin-left: 20px; color: var(--text-secondary);">
                            <li><strong>종합 평점:</strong> 슬라이더로 0~100점 사이 점수 부여</li>
                            <li><strong>감상평:</strong> 이 사케에 대한 자유로운 한줄평</li>
                        </ul>
                    </div>

                    <!-- 내 노트 관리하기 -->
                    <h2 style="color: var(--accent-primary); margin-bottom: 25px; font-family: 'Cormorant Garamond', serif; font-size: 1.5em;">📚 내 노트 관리하기</h2>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px;">
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <div style="font-size: 2em; margin-bottom: 15px;">🔍</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">검색 기능</h3>
                            <p style="color: var(--text-secondary); font-size: 0.95em;">사케 이름, 양조장, 종류로 노트를 검색할 수 있습니다.</p>
                        </div>
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <div style="font-size: 2em; margin-bottom: 15px;">✏️</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">수정하기</h3>
                            <p style="color: var(--text-secondary); font-size: 0.95em;">카드를 클릭하면 상세 보기가 열리고, 수정할 수 있습니다.</p>
                        </div>
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <div style="font-size: 2em; margin-bottom: 15px;">🗑️</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">삭제하기</h3>
                            <p style="color: var(--text-secondary); font-size: 0.95em;">더 이상 필요 없는 노트는 삭제할 수 있습니다.</p>
                        </div>
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <div style="font-size: 2em; margin-bottom: 15px;">☁️</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">자동 저장</h3>
                            <p style="color: var(--text-secondary); font-size: 0.95em;">모든 노트는 클라우드에 자동으로 동기화됩니다.</p>
                        </div>
                    </div>

                    <!-- 팁 -->
                    <div style="background: linear-gradient(135deg, var(--accent-gold), var(--accent-rose)); padding: 30px; border-radius: 20px; color: white; margin-bottom: 40px;">
                        <h3 style="margin-bottom: 20px;">💡 더 잘 활용하는 팁</h3>
                        <ul style="margin-left: 20px; opacity: 0.95;">
                            <li style="margin-bottom: 10px;">테이스팅 직후 바로 기록하면 더 정확합니다.</li>
                            <li style="margin-bottom: 10px;">같은 사케도 온도에 따라 맛이 다르니, 온도도 함께 기록하세요.</li>
                            <li style="margin-bottom: 10px;">함께 먹은 음식을 메모해두면 나중에 페어링 참고가 됩니다.</li>
                            <li style="margin-bottom: 10px;">다크 모드는 바나 레스토랑에서 눈의 피로를 줄여줍니다.</li>
                            <li>사진은 라벨을 선명하게 찍어두면 나중에 다시 찾기 좋습니다.</li>
                        </ul>
                    </div>

                    <p style="margin-top: 50px; color: var(--text-muted); font-size: 0.9em; text-align: center;">
                        마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}
                    </p>
                </div>
            </div>
    `,

    regions: () => `
            <div style="max-width: 1000px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 50px;">
                    <h1 style="font-size: 2.5em; margin: 20px 0; color: var(--accent-primary); font-family: 'Cormorant Garamond', serif;">일본 지역별 사케</h1>
                    <p style="color: var(--text-muted);">테루아가 만드는 사케의 개성, 일본 전국의 명주 탐험</p>
                    <div style="width: 60px; height: 2px; background: linear-gradient(90deg, var(--accent-gold), var(--accent-rose)); margin: 20px auto;"></div>
                </div>

                <div style="line-height: 1.9; color: var(--text-primary);">
                    <!-- 소개 -->
                    <div style="background: var(--bg-tertiary); padding: 35px; border-radius: 20px; margin-bottom: 50px;">
                        <p style="font-size: 1.05em; color: var(--text-secondary);">
                            일본에는 약 1,400개의 사케 양조장이 47개 도도부현에 퍼져 있습니다.
                            각 지역의 기후, 물, 쌀, 그리고 양조 전통이 어우러져 고유한 스타일의 사케가 탄생합니다.
                            프랑스 와인에 테루아가 있듯이, 일본 사케에도 지역의 특성이 깃들어 있습니다.
                        </p>
                    </div>

                    <!-- 니가타 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 30px; border: 1px solid var(--border-light);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <span style="font-size: 2.5em;">🏔️</span>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">니가타현 (新潟県)</h2>
                                <p style="color: var(--accent-gold); margin: 5px 0 0;">일본 사케의 메카</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;"><strong>특징:</strong> 깨끗하고 드라이한 "단레이 카라쿠치(淡麗辛口)" 스타일의 발상지. 눈 녹은 물로 만드는 맑고 순수한 맛.</p>
                        <p style="margin-bottom: 15px;"><strong>유명 양조장:</strong> 아사히 슈조(久保田), 핫카이산(八海山), 코시노칸바이(越乃寒梅)</p>
                        <p style="margin-bottom: 15px;"><strong>대표 사케:</strong> 쿠보타 만주, 핫카이산 준마이 다이긴조, 코시노칸바이 긴라벨</p>
                        <p><strong>페어링:</strong> 담백한 해산물, 소바, 에다마메</p>
                    </div>

                    <!-- 효고 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 30px; border: 1px solid var(--border-light);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <span style="font-size: 2.5em;">🌾</span>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">효고현 (兵庫県)</h2>
                                <p style="color: var(--accent-gold); margin: 5px 0 0;">야마다니시키의 고향, 나다의 전통</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;"><strong>특징:</strong> 일본 최고의 양조 쌀 '야마다니시키'의 주산지. 미야미즈(宮水)라 불리는 미네랄 풍부한 물로 강건한 맛의 사케 생산.</p>
                        <p style="margin-bottom: 15px;"><strong>유명 양조장:</strong> 하쿠쓰루(白鶴), 기쿠마사무네(菊正宗), 오제키(大関)</p>
                        <p style="margin-bottom: 15px;"><strong>대표 사케:</strong> 하쿠쓰루 준마이, 기쿠마사무네 키모토</p>
                        <p><strong>페어링:</strong> 고베 규, 오뎅, 진한 국물 요리</p>
                    </div>

                    <!-- 야마가타 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 30px; border: 1px solid var(--border-light);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <span style="font-size: 2.5em;">🍎</span>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">야마가타현 (山形県)</h2>
                                <p style="color: var(--accent-gold); margin: 5px 0 0;">과일향 가득한 사케의 보고</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;"><strong>특징:</strong> 화려한 과일향의 긴조 스타일이 유명. "데와산산(出羽燦々)" 등 지역 양조 쌀 개발에 적극적.</p>
                        <p style="margin-bottom: 15px;"><strong>유명 양조장:</strong> 데와자쿠라(出羽桜), 쥬욘다이(十四代), 도호쿠 메이조</p>
                        <p style="margin-bottom: 15px;"><strong>대표 사케:</strong> 데와자쿠라 오카, 쥬욘다이 (환상의 사케로 불림)</p>
                        <p><strong>페어링:</strong> 과일, 가벼운 전채, 화이트 초콜릿</p>
                    </div>

                    <!-- 교토 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 30px; border: 1px solid var(--border-light);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <span style="font-size: 2.5em;">⛩️</span>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">교토부 (京都府) - 후시미</h2>
                                <p style="color: var(--accent-gold); margin: 5px 0 0;">천년 고도의 우아한 사케</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;"><strong>특징:</strong> 부드러운 연수(軟水)로 만드는 우아하고 섬세한 "온나자케(女酒)" 스타일. 나다의 남성적 사케와 대비됨.</p>
                        <p style="margin-bottom: 15px;"><strong>유명 양조장:</strong> 겟게이칸(月桂冠), 타카라(宝), 코오시노이즈미</p>
                        <p style="margin-bottom: 15px;"><strong>대표 사케:</strong> 겟게이칸 덴카, 쇼치쿠바이</p>
                        <p><strong>페어링:</strong> 교토 가이세키, 두부 요리, 유바</p>
                    </div>

                    <!-- 히로시마 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 30px; border: 1px solid var(--border-light);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <span style="font-size: 2.5em;">🦪</span>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">히로시마현 (広島県)</h2>
                                <p style="color: var(--accent-gold); margin: 5px 0 0;">긴조 양조법의 혁신지</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;"><strong>특징:</strong> 근대 긴조 양조 기술의 발상지. 매우 부드러운 연수로 감미롭고 풍부한 맛의 사케 생산.</p>
                        <p style="margin-bottom: 15px;"><strong>유명 양조장:</strong> 카모츠루(賀茂鶴), 센주(千寿), 우고노츠키</p>
                        <p style="margin-bottom: 15px;"><strong>대표 사케:</strong> 카모츠루 다이긴조, 히로시마 스이신</p>
                        <p><strong>페어링:</strong> 히로시마 굴, 모미지 만주, 오코노미야키</p>
                    </div>

                    <!-- 아키타 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 30px; border: 1px solid var(--border-light);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <span style="font-size: 2.5em;">❄️</span>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">아키타현 (秋田県)</h2>
                                <p style="color: var(--accent-gold); margin: 5px 0 0;">눈의 나라, 부드러운 사케</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;"><strong>특징:</strong> 아키타 고마치 쌀과 순수한 설산 수원으로 만드는 깨끗하고 부드러운 사케. 전통 키모토 방식도 유명.</p>
                        <p style="margin-bottom: 15px;"><strong>유명 양조장:</strong> 아라마사(新政), 유키노보샤(雪の茅舎), 타카시미즈</p>
                        <p style="margin-bottom: 15px;"><strong>대표 사케:</strong> 아라마사 No.6, 유키노보샤 준마이긴조</p>
                        <p><strong>페어링:</strong> 키리탄포 나베, 이나니와 우동, 절임류</p>
                    </div>

                    <!-- 후쿠시마 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 40px; border: 1px solid var(--border-light);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <span style="font-size: 2.5em;">🏆</span>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">후쿠시마현 (福島県)</h2>
                                <p style="color: var(--accent-gold); margin: 5px 0 0;">7년 연속 금상 1위의 저력</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;"><strong>특징:</strong> 전국신주감평회(全国新酒鑑評会)에서 7년 연속 금상 수상 최다 기록. 밸런스 좋은 고품질 사케의 대명사.</p>
                        <p style="margin-bottom: 15px;"><strong>유명 양조장:</strong> 스에히로(末廣), 다이시치(大七), 히로키</p>
                        <p style="margin-bottom: 15px;"><strong>대표 사케:</strong> 히로키 준마이, 다이시치 키모토 준마이</p>
                        <p><strong>페어링:</strong> 키타카타 라멘, 말고기, 된장 절임</p>
                    </div>

                    <!-- 지도 안내 -->
                    <div style="background: var(--bg-tertiary); padding: 30px; border-radius: 20px; text-align: center;">
                        <h3 style="color: var(--accent-primary); margin-bottom: 15px;">🗾 사케 여행을 떠나보세요</h3>
                        <p style="color: var(--text-secondary);">각 지역을 방문하면 양조장 견학과 시음을 즐길 수 있습니다.<br>현지에서 마시는 신선한 사케는 또 다른 감동을 선사합니다.</p>
                    </div>

                    <p style="margin-top: 50px; color: var(--text-muted); font-size: 0.9em; text-align: center;">
                        마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}
                    </p>
                </div>
            </div>
    `,

    brewing: () => `
            <div style="max-width: 1000px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 50px;">
                    <h1 style="font-size: 2.5em; margin: 20px 0; color: var(--accent-primary); font-family: 'Cormorant Garamond', serif;">사케 양조 과정</h1>
                    <p style="color: var(--text-muted);">쌀에서 술이 되기까지, 사케 탄생의 여정</p>
                    <div style="width: 60px; height: 2px; background: linear-gradient(90deg, var(--accent-gold), var(--accent-rose)); margin: 20px auto;"></div>
                </div>

                <div style="line-height: 1.9; color: var(--text-primary);">
                    <!-- 개요 -->
                    <div style="background: var(--bg-tertiary); padding: 35px; border-radius: 20px; margin-bottom: 50px;">
                        <p style="font-size: 1.05em; color: var(--text-secondary);">
                            사케 양조는 수백 년에 걸쳐 발전해온 정교한 기술입니다. 쌀을 술로 바꾸는 과정에는 과학과 장인 정신이 절묘하게 어우러져 있습니다.
                            한 병의 사케가 만들어지기까지 약 60일 이상이 소요되며, 토지(杜氏)라 불리는 양조 장인의 섬세한 손길이 필요합니다.
                        </p>
                    </div>

                    <!-- 1단계: 정미 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 25px; border-left: 5px solid var(--accent-gold);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <div style="min-width: 60px; height: 60px; background: var(--accent-gold); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.5em;">1</div>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">정미 (精米, せいまい)</h2>
                                <p style="color: var(--accent-gold); margin: 5px 0 0;">쌀 깎기</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;">현미의 바깥층에는 단백질, 지방, 비타민이 많이 포함되어 있는데, 이것들이 사케의 잡맛을 유발합니다. 정미 과정에서 이 부분을 깎아내어 중심의 전분만 남깁니다.</p>
                        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px;">
                            <p style="color: var(--text-secondary);"><strong>정미보합에 따른 등급:</strong></p>
                            <ul style="margin-left: 20px; color: var(--text-secondary);">
                                <li>70% 이하 → 혼조조</li>
                                <li>60% 이하 → 긴조</li>
                                <li>50% 이하 → 다이긴조</li>
                            </ul>
                        </div>
                    </div>

                    <!-- 2단계: 세미 & 침지 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 25px; border-left: 5px solid var(--accent-rose);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <div style="min-width: 60px; height: 60px; background: var(--accent-rose); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.5em;">2</div>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">세미 & 침지 (洗米・浸漬)</h2>
                                <p style="color: var(--accent-rose); margin: 5px 0 0;">쌀 씻기와 물 흡수</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;">깎은 쌀을 씻어 겉에 남은 쌀겨를 제거하고, 물에 담가 수분을 흡수시킵니다. 이 과정의 시간 조절이 매우 중요합니다. 다이긴조급 쌀은 초 단위로 침지 시간을 관리합니다.</p>
                    </div>

                    <!-- 3단계: 증미 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 25px; border-left: 5px solid var(--accent-gold);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <div style="min-width: 60px; height: 60px; background: var(--accent-gold); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.5em;">3</div>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">증미 (蒸米, むしまい)</h2>
                                <p style="color: var(--accent-gold); margin: 5px 0 0;">쌀 찌기</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;">코시키(甑)라는 대형 찜통에서 약 1시간 동안 쌀을 찝니다. "겉은 단단하고 속은 부드럽게(外硬内軟)" 찌는 것이 이상적입니다. 찐 쌀은 누룩 만들기, 술밑(모토), 담금에 나누어 사용됩니다.</p>
                    </div>

                    <!-- 4단계: 제국 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 25px; border-left: 5px solid var(--accent-rose);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <div style="min-width: 60px; height: 60px; background: var(--accent-rose); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.5em;">4</div>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">제국 (製麹, せいきく)</h2>
                                <p style="color: var(--accent-rose); margin: 5px 0 0;">누룩 만들기</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;">사케 양조에서 가장 중요한 과정입니다. 찐 쌀에 코지균(Aspergillus oryzae)을 뿌려 48시간 동안 온도와 습도를 관리하며 누룩을 만듭니다.</p>
                        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px;">
                            <p style="color: var(--text-secondary);"><strong>누룩의 역할:</strong> 쌀의 전분을 포도당으로 분해합니다. 이 당화 과정이 있어야 효모가 알코올을 만들 수 있습니다.</p>
                        </div>
                    </div>

                    <!-- 5단계: 슈보 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 25px; border-left: 5px solid var(--accent-gold);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <div style="min-width: 60px; height: 60px; background: var(--accent-gold); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.5em;">5</div>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">슈보 (酒母, しゅぼ)</h2>
                                <p style="color: var(--accent-gold); margin: 5px 0 0;">술밑(酛) 만들기</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;">누룩, 찐 쌀, 물, 효모를 섞어 효모를 대량으로 배양합니다. 약 2주간 진행되며, 건강한 효모 집단이 이후 발효의 주역이 됩니다.</p>
                        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px;">
                            <p style="color: var(--text-secondary);"><strong>전통 방식:</strong></p>
                            <ul style="margin-left: 20px; color: var(--text-secondary);">
                                <li><strong>키모토(生酛):</strong> 천연 유산균을 이용한 전통 방식. 깊고 복잡한 맛.</li>
                                <li><strong>야마하이(山廃):</strong> 키모토의 변형. 쌀 으깨는 과정 생략.</li>
                                <li><strong>소쿠조(速醸):</strong> 유산을 직접 첨가하는 현대 방식. 깔끔한 맛.</li>
                            </ul>
                        </div>
                    </div>

                    <!-- 6단계: 모로미 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 25px; border-left: 5px solid var(--accent-rose);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <div style="min-width: 60px; height: 60px; background: var(--accent-rose); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.5em;">6</div>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">모로미 (醪)</h2>
                                <p style="color: var(--accent-rose); margin: 5px 0 0;">본격 발효 - 산단지코미</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;">슈보에 누룩, 찐 쌀, 물을 3번에 걸쳐 나누어 넣는 "산단지코미(三段仕込み)" 방식으로 본격 발효가 시작됩니다.</p>
                        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px; margin-bottom: 15px;">
                            <p style="color: var(--text-secondary);"><strong>3단계 담금:</strong></p>
                            <ul style="margin-left: 20px; color: var(--text-secondary);">
                                <li><strong>하츠조에(初添):</strong> 1일차 - 첫 번째 투입</li>
                                <li><strong>오도리(踊):</strong> 2일차 - 휴식일 (효모 증식)</li>
                                <li><strong>나카조에(仲添):</strong> 3일차 - 두 번째 투입</li>
                                <li><strong>토메조에(留添):</strong> 4일차 - 세 번째 투입</li>
                            </ul>
                        </div>
                        <p style="color: var(--text-secondary);">이후 18-32일 동안 <strong>병행복발효(並行複発酵)</strong>가 진행됩니다. 누룩이 전분을 당으로 바꾸는 동시에 효모가 당을 알코올로 바꿉니다. 이 독특한 방식 덕분에 사케는 양조주 중 가장 높은 알코올 도수(약 20%)를 달성합니다.</p>
                    </div>

                    <!-- 7단계: 압착 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 25px; border-left: 5px solid var(--accent-gold);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <div style="min-width: 60px; height: 60px; background: var(--accent-gold); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.5em;">7</div>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">조소 (上槽, じょうそう)</h2>
                                <p style="color: var(--accent-gold); margin: 5px 0 0;">압착 / 짜기</p>
                            </div>
                        </div>
                        <p style="margin-bottom: 15px;">발효가 완료된 모로미를 압착하여 술(사케)과 술지게미(사케카스)로 분리합니다. 이 순간부터 비로소 '사케'라 부를 수 있습니다.</p>
                        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px;">
                            <p style="color: var(--text-secondary);"><strong>압착 방식:</strong></p>
                            <ul style="margin-left: 20px; color: var(--text-secondary);">
                                <li><strong>야부타(藪田):</strong> 기계 압착. 대량 생산에 사용.</li>
                                <li><strong>후네(槽):</strong> 전통 목재 압착기. 부드러운 압착.</li>
                                <li><strong>시즈쿠(雫/しずく):</strong> 중력만으로 자연 낙하. 최고급 방식.</li>
                            </ul>
                        </div>
                    </div>

                    <!-- 8단계: 숙성 & 출하 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 40px; border-left: 5px solid var(--accent-rose);">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <div style="min-width: 60px; height: 60px; background: var(--accent-rose); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.5em;">8</div>
                            <div>
                                <h2 style="color: var(--accent-primary); margin: 0; font-family: 'Cormorant Garamond', serif;">여과, 살균, 숙성</h2>
                                <p style="color: var(--accent-rose); margin: 5px 0 0;">마무리 단계</p>
                            </div>
                        </div>
                        <div style="display: grid; gap: 15px;">
                            <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px;">
                                <p style="color: var(--text-secondary);"><strong>오리비키(滓引き):</strong> 침전물 제거</p>
                            </div>
                            <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px;">
                                <p style="color: var(--text-secondary);"><strong>로카(濾過):</strong> 활성탄 등으로 여과하여 맑게 함</p>
                            </div>
                            <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px;">
                                <p style="color: var(--text-secondary);"><strong>히이레(火入れ):</strong> 60-65°C로 저온 살균 (보통 2회)</p>
                            </div>
                            <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px;">
                                <p style="color: var(--text-secondary);"><strong>쵸조(貯蔵):</strong> 수개월~수년 숙성</p>
                            </div>
                            <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px;">
                                <p style="color: var(--text-secondary);"><strong>가수(加水):</strong> 물을 첨가하여 알코올 도수 조정 (15-16%로)</p>
                            </div>
                        </div>
                    </div>

                    <!-- 마무리 -->
                    <div style="background: linear-gradient(135deg, var(--accent-gold), var(--accent-rose)); padding: 30px; border-radius: 20px; text-align: center; color: white;">
                        <h3 style="margin-bottom: 15px;">🍶 장인의 마음이 담긴 한 잔</h3>
                        <p style="opacity: 0.95;">쌀 한 알에서 시작된 긴 여정이 당신의 잔에 닿기까지,<br>수많은 사람들의 정성과 기술이 담겨 있습니다.</p>
                    </div>

                    <p style="margin-top: 50px; color: var(--text-muted); font-size: 0.9em; text-align: center;">
                        마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}
                    </p>
                </div>
            </div>
    `,

    etiquette: () => `
            <div style="max-width: 900px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 50px;">
                    <h1 style="font-size: 2.5em; margin: 20px 0; color: var(--accent-primary); font-family: 'Cormorant Garamond', serif;">사케 에티켓</h1>
                    <p style="color: var(--text-muted);">알면 더 즐거운 사케 음주 예절</p>
                    <div style="width: 60px; height: 2px; background: linear-gradient(90deg, var(--accent-gold), var(--accent-rose)); margin: 20px auto;"></div>
                </div>

                <div style="line-height: 1.9; color: var(--text-primary);">
                    <!-- 기본 예절 -->
                    <h2 style="color: var(--accent-gold); margin-bottom: 25px; font-size: 1.3em;">🎌 기본 예절</h2>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border-left: 4px solid var(--accent-gold);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">오샤쿠 (お酌) - 서로 따라주기</h3>
                        <p style="color: var(--text-secondary);">일본에서 사케는 혼자 따라 마시지 않습니다. 상대방의 잔이 비면 따라주고, 상대방도 당신의 잔에 따라줍니다. 이것을 <strong>오샤쿠</strong>라고 하며, 함께 나누는 문화의 핵심입니다. 자신이 직접 따르는 것(테샤쿠)은 친한 사이에서만 허용됩니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border-left: 4px solid var(--accent-rose);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">두 손으로 받기</h3>
                        <p style="color: var(--text-secondary);">사케를 받을 때는 한 손으로 잔을 잡고, 다른 손으로 잔 아래를 받칩니다. 특히 윗사람에게 받을 때는 반드시 두 손으로 정중하게 받습니다. 따라줄 때도 양손으로 도쿠리(덕쿠리)를 잡습니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 40px; border-left: 4px solid var(--accent-gold);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">칸파이! (乾杯)</h3>
                        <p style="color: var(--text-secondary);">"칸파이!"는 한국의 "건배"와 같습니다. 첫 잔은 반드시 다 함께 잔을 들고 건배를 한 후 마십니다. 잔을 부딪칠 때 자신의 잔을 상대방보다 낮게 두면 더 예의 바른 표현입니다.</p>
                    </div>

                    <!-- 도쿠리 사용법 -->
                    <h2 style="color: var(--accent-gold); margin-bottom: 25px; font-size: 1.3em;">🍶 도쿠리(徳利) 사용법</h2>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 40px;">
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <div style="font-size: 2em; margin-bottom: 15px;">✅</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">올바른 방법</h3>
                            <ul style="color: var(--text-secondary); margin-left: 20px; font-size: 0.95em;">
                                <li>도쿠리 목 부분을 한 손으로 잡기</li>
                                <li>다른 손으로 바닥 받치기</li>
                                <li>천천히 기울여 따르기</li>
                                <li>마지막에 살짝 비틀어 끊기</li>
                            </ul>
                        </div>
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <div style="font-size: 2em; margin-bottom: 15px;">❌</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">피해야 할 것</h3>
                            <ul style="color: var(--text-secondary); margin-left: 20px; font-size: 0.95em;">
                                <li>주둥이를 잔 안에 넣기</li>
                                <li>거꾸로 들어 탁탁 치기</li>
                                <li>너무 빨리 따르기</li>
                                <li>넘치도록 따르기</li>
                            </ul>
                        </div>
                    </div>

                    <!-- 잔 선택 -->
                    <h2 style="color: var(--accent-gold); margin-bottom: 25px; font-size: 1.3em;">🥃 사케 잔의 종류</h2>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px;">
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; text-align: center; border: 1px solid var(--border-light);">
                            <div style="font-size: 2.5em; margin-bottom: 15px;">🍵</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">오초코 (お猪口)</h3>
                            <p style="color: var(--text-secondary); font-size: 0.9em;">작은 도자기 잔. 가장 일반적. 따뜻한 사케에 적합.</p>
                        </div>
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; text-align: center; border: 1px solid var(--border-light);">
                            <div style="font-size: 2.5em; margin-bottom: 15px;">🪵</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">마스 (枡)</h3>
                            <p style="color: var(--text-secondary); font-size: 0.9em;">사각 나무 잔. 히노키 향이 더해짐. 축하 자리에 사용.</p>
                        </div>
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; text-align: center; border: 1px solid var(--border-light);">
                            <div style="font-size: 2.5em; margin-bottom: 15px;">🍷</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">와인 글라스</h3>
                            <p style="color: var(--text-secondary); font-size: 0.9em;">향을 즐기기에 최적. 긴조, 다이긴조에 추천.</p>
                        </div>
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; text-align: center; border: 1px solid var(--border-light);">
                            <div style="font-size: 2.5em; margin-bottom: 15px;">🥛</div>
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">기키초코 (利き猪口)</h3>
                            <p style="color: var(--text-secondary); font-size: 0.9em;">청백 동심원 도자기 잔. 전문 테이스팅용.</p>
                        </div>
                    </div>

                    <!-- 상황별 예절 -->
                    <h2 style="color: var(--accent-gold); margin-bottom: 25px; font-size: 1.3em;">🎎 상황별 예절</h2>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border-left: 4px solid var(--accent-gold);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">비즈니스 자리</h3>
                        <ul style="color: var(--text-secondary); margin-left: 20px;">
                            <li>상사나 거래처에게 먼저 따라드립니다.</li>
                            <li>자신의 잔은 비워둔 채 대기하다가 상대방이 따라줄 때 받습니다.</li>
                            <li>취할 정도로 마시지 않습니다.</li>
                            <li>첫 잔은 맥주로 시작하고, 사케는 두 번째 술로 마시는 것이 일반적입니다.</li>
                        </ul>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border-left: 4px solid var(--accent-rose);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">이자카야 / 캐주얼한 자리</h3>
                        <ul style="color: var(--text-secondary); margin-left: 20px;">
                            <li>편하게 즐기되, 기본적인 오샤쿠 문화는 지킵니다.</li>
                            <li>모리키리(盛り切り)로 주문하면 잔에 넘치도록 따라주는 서비스를 받을 수 있습니다.</li>
                            <li>"이키(粋)"하게 — 과하지 않고 멋스럽게 즐기는 것이 미덕입니다.</li>
                        </ul>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 40px; border-left: 4px solid var(--accent-gold);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">료칸 / 가이세키</h3>
                        <ul style="color: var(--text-secondary); margin-left: 20px;">
                            <li>나카이(仲居, 여성 종업원)가 따라드리면 정중히 두 손으로 받습니다.</li>
                            <li>코스 요리와 함께 천천히 즐깁니다.</li>
                            <li>각 요리에 맞는 사케를 추천받아 마시면 더 좋습니다.</li>
                        </ul>
                    </div>

                    <!-- 알아두면 좋은 표현 -->
                    <h2 style="color: var(--accent-gold); margin-bottom: 25px; font-size: 1.3em;">💬 알아두면 좋은 표현</h2>

                    <div style="display: grid; gap: 15px; margin-bottom: 40px;">
                        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px; display: flex; gap: 20px; align-items: center;">
                            <div style="min-width: 150px; color: var(--accent-gold); font-weight: bold;">칸파이!</div>
                            <div style="color: var(--text-secondary);">건배! (乾杯)</div>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px; display: flex; gap: 20px; align-items: center;">
                            <div style="min-width: 150px; color: var(--accent-gold); font-weight: bold;">오츠카레사마데스</div>
                            <div style="color: var(--text-secondary);">수고하셨습니다 (お疲れ様です) - 퇴근 후 건배사로 자주 사용</div>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px; display: flex; gap: 20px; align-items: center;">
                            <div style="min-width: 150px; color: var(--accent-gold); font-weight: bold;">모우 잇파이</div>
                            <div style="color: var(--text-secondary);">한 잔 더요 (もう一杯)</div>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px; display: flex; gap: 20px; align-items: center;">
                            <div style="min-width: 150px; color: var(--accent-gold); font-weight: bold;">오이시이!</div>
                            <div style="color: var(--text-secondary);">맛있다! (美味しい)</div>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px; display: flex; gap: 20px; align-items: center;">
                            <div style="min-width: 150px; color: var(--accent-gold); font-weight: bold;">고치소사마데시타</div>
                            <div style="color: var(--text-secondary);">잘 먹었습니다 (ごちそうさまでした)</div>
                        </div>
                    </div>

                    <div style="background: linear-gradient(135deg, var(--accent-gold), var(--accent-rose)); padding: 30px; border-radius: 20px; text-align: center; color: white;">
                        <h3 style="margin-bottom: 15px;">🍶 에티켓보다 중요한 것</h3>
                        <p style="opacity: 0.95;">가장 중요한 건 함께하는 사람들과 즐거운 시간을 보내는 것입니다.<br>너무 격식에 얽매이지 말고, 진심으로 사케를 즐기세요!</p>
                    </div>

                    <p style="margin-top: 50px; color: var(--text-muted); font-size: 0.9em; text-align: center;">
                        마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}
                    </p>
                </div>
            </div>
    `,

    recommendations: () => `
            <div style="max-width: 1000px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 50px;">
                    <h1 style="font-size: 2.5em; margin: 20px 0; color: var(--accent-primary); font-family: 'Cormorant Garamond', serif;">추천 사케</h1>
                    <p style="color: var(--text-muted);">상황별, 취향별 사케 추천 리스트</p>
                    <div style="width: 60px; height: 2px; background: linear-gradient(90deg, var(--accent-gold), var(--accent-rose)); margin: 20px auto;"></div>
                </div>

                <div style="line-height: 1.9; color: var(--text-primary);">
                    <!-- 입문자 추천 -->
                    <h2 style="color: var(--accent-gold); margin-bottom: 25px; font-size: 1.3em;">🌱 입문자를 위한 추천</h2>

                    <div style="display: grid; gap: 20px; margin-bottom: 50px;">
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 15px;">
                                <div>
                                    <h3 style="color: var(--accent-primary); margin-bottom: 5px;">닷사이 45 (獺祭 45)</h3>
                                    <p style="color: var(--accent-gold); font-size: 0.9em;">아사히 슈조 | 야마구치현</p>
                                </div>
                                <span style="background: var(--accent-gold); color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85em;">준마이 다이긴조</span>
                            </div>
                            <p style="color: var(--text-secondary); margin-top: 15px;">입문자에게 가장 많이 추천되는 사케. 깔끔하고 과일향이 좋으며 밸런스가 뛰어납니다. 정미보합 45%의 준마이 다이긴조로, 가격 대비 품질이 우수합니다.</p>
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-light);">
                                <span style="color: var(--text-muted); font-size: 0.9em;">💰 약 3-4만원대 | 🌡️ 차게 (10°C)</span>
                            </div>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 15px;">
                                <div>
                                    <h3 style="color: var(--accent-primary); margin-bottom: 5px;">쿠보타 센주 (久保田 千寿)</h3>
                                    <p style="color: var(--accent-gold); font-size: 0.9em;">아사히 슈조 | 니가타현</p>
                                </div>
                                <span style="background: var(--accent-rose); color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85em;">긴조</span>
                            </div>
                            <p style="color: var(--text-secondary); margin-top: 15px;">니가타 단레이 카라쿠치 스타일의 대표주자. 드라이하고 깔끔한 맛으로 식사와 함께 마시기 좋습니다. 질리지 않는 맛.</p>
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-light);">
                                <span style="color: var(--text-muted); font-size: 0.9em;">💰 약 3만원대 | 🌡️ 차게~상온 (10-20°C)</span>
                            </div>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 15px;">
                                <div>
                                    <h3 style="color: var(--accent-primary); margin-bottom: 5px;">핫카이산 토쿠베츠 혼조조 (八海山 特別本醸造)</h3>
                                    <p style="color: var(--accent-gold); font-size: 0.9em;">핫카이산 슈조 | 니가타현</p>
                                </div>
                                <span style="background: var(--accent-gold); color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85em;">토쿠베츠 혼조조</span>
                            </div>
                            <p style="color: var(--text-secondary); margin-top: 15px;">가벼우면서도 깊은 맛. 합리적인 가격으로 데일리 사케로 인기. 데워서 마셔도 맛있어 다양하게 즐길 수 있습니다.</p>
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-light);">
                                <span style="color: var(--text-muted); font-size: 0.9em;">💰 약 2만원대 | 🌡️ 차게~따뜻하게 (5-45°C)</span>
                            </div>
                        </div>
                    </div>

                    <!-- 특별한 날 추천 -->
                    <h2 style="color: var(--accent-gold); margin-bottom: 25px; font-size: 1.3em;">🎉 특별한 날을 위한 프리미엄</h2>

                    <div style="display: grid; gap: 20px; margin-bottom: 50px;">
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 15px;">
                                <div>
                                    <h3 style="color: var(--accent-primary); margin-bottom: 5px;">닷사이 23 (獺祭 二割三分)</h3>
                                    <p style="color: var(--accent-gold); font-size: 0.9em;">아사히 슈조 | 야마구치현</p>
                                </div>
                                <span style="background: linear-gradient(135deg, var(--accent-gold), var(--accent-rose)); color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85em;">준마이 다이긴조</span>
                            </div>
                            <p style="color: var(--text-secondary); margin-top: 15px;">정미보합 23%라는 극단적인 도정의 최고급 사케. 쌀의 77%를 깎아낸 순수한 심백만 사용. 꽃과 과일의 화려한 향, 벨벳처럼 부드러운 질감.</p>
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-light);">
                                <span style="color: var(--text-muted); font-size: 0.9em;">💰 약 10만원대 | 🌡️ 차게 (5-10°C)</span>
                            </div>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 15px;">
                                <div>
                                    <h3 style="color: var(--accent-primary); margin-bottom: 5px;">쥬욘다이 (十四代)</h3>
                                    <p style="color: var(--accent-gold); font-size: 0.9em;">타카기 슈조 | 야마가타현</p>
                                </div>
                                <span style="background: linear-gradient(135deg, var(--accent-gold), var(--accent-rose)); color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85em;">환상의 사케</span>
                            </div>
                            <p style="color: var(--text-secondary); margin-top: 15px;">'환상의 사케'로 불리는 전설적인 브랜드. 구하기 매우 어려워 프리미엄 가격에 거래됩니다. 과일처럼 달콤하면서도 깔끔한 여운이 특징.</p>
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-light);">
                                <span style="color: var(--text-muted); font-size: 0.9em;">💰 시가 (정가 2-3만원, 실거래 10만원+) | 🌡️ 차게</span>
                            </div>
                        </div>

                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 15px;">
                                <div>
                                    <h3 style="color: var(--accent-primary); margin-bottom: 5px;">이소지만 준마이 다이긴조 (磯自慢)</h3>
                                    <p style="color: var(--accent-gold); font-size: 0.9em;">이소지만 슈조 | 시즈오카현</p>
                                </div>
                                <span style="background: linear-gradient(135deg, var(--accent-gold), var(--accent-rose)); color: white; padding: 5px 15px; border-radius: 20px; font-size: 0.85em;">준마이 다이긴조</span>
                            </div>
                            <p style="color: var(--text-secondary); margin-top: 15px;">시즈오카의 명문 양조장. G7 정상회담 만찬주로 선정될 만큼 품격있는 사케. 청아한 향과 깊은 우마미의 절묘한 조화.</p>
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-light);">
                                <span style="color: var(--text-muted); font-size: 0.9em;">💰 약 8-15만원대 | 🌡️ 차게 (5-12°C)</span>
                            </div>
                        </div>
                    </div>

                    <!-- 데일리 추천 -->
                    <h2 style="color: var(--accent-gold); margin-bottom: 25px; font-size: 1.3em;">🏠 데일리 사케 (가성비)</h2>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 50px;">
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">오제키 준마이</h3>
                            <p style="color: var(--accent-gold); font-size: 0.9em; margin-bottom: 10px;">효고현</p>
                            <p style="color: var(--text-secondary); font-size: 0.95em;">대형마트에서 쉽게 구할 수 있는 가성비 좋은 준마이. 데워서 마시면 맛있습니다.</p>
                            <p style="color: var(--text-muted); font-size: 0.85em; margin-top: 10px;">💰 1만원대</p>
                        </div>
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">하쿠쓰루 준마이</h3>
                            <p style="color: var(--accent-gold); font-size: 0.9em; margin-bottom: 10px;">효고현</p>
                            <p style="color: var(--text-secondary); font-size: 0.95em;">일본 판매량 1위 브랜드. 안정적인 품질과 합리적인 가격. 어떤 음식과도 잘 어울립니다.</p>
                            <p style="color: var(--text-muted); font-size: 0.85em; margin-top: 10px;">💰 1.5만원대</p>
                        </div>
                        <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; border: 1px solid var(--border-light);">
                            <h3 style="color: var(--accent-primary); margin-bottom: 10px;">겟게이칸 토쿠센</h3>
                            <p style="color: var(--accent-gold); font-size: 0.9em; margin-bottom: 10px;">교토 후시미</p>
                            <p style="color: var(--text-secondary); font-size: 0.95em;">교토 후시미의 부드러운 물로 만든 깔끔한 맛. 차갑게도 데워서도 OK.</p>
                            <p style="color: var(--text-muted); font-size: 0.85em; margin-top: 10px;">💰 1만원대</p>
                        </div>
                    </div>

                    <!-- 상황별 추천 -->
                    <h2 style="color: var(--accent-gold); margin-bottom: 25px; font-size: 1.3em;">🎯 상황별 추천</h2>

                    <div style="display: grid; gap: 20px; margin-bottom: 40px;">
                        <div style="background: var(--bg-tertiary); padding: 25px; border-radius: 16px;">
                            <h3 style="color: var(--accent-primary); margin-bottom: 15px;">🍣 회/초밥과 함께</h3>
                            <p style="color: var(--text-secondary);">다이긴조급의 섬세한 사케. <strong>닷사이 45</strong>, <strong>데와자쿠라 오카</strong> 추천. 생선의 맛을 해치지 않으면서 깔끔하게 마무리해줍니다.</p>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 25px; border-radius: 16px;">
                            <h3 style="color: var(--accent-primary); margin-bottom: 15px;">🍖 야키토리/야키니쿠와 함께</h3>
                            <p style="color: var(--text-secondary);">풍미가 진한 준마이 또는 혼조조. <strong>기쿠마사무네 키모토</strong>, <strong>다이시치 키모토</strong> 추천. 기름진 맛을 잡아주고 우마미를 더해줍니다.</p>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 25px; border-radius: 16px;">
                            <h3 style="color: var(--accent-primary); margin-bottom: 15px;">🍲 전골/나베와 함께</h3>
                            <p style="color: var(--text-secondary);">따뜻하게 데운 준마이. <strong>핫카이산 혼조조 아츠칸</strong>, <strong>쿠보타 센주 칸</strong> 추천. 따뜻한 국물과 따뜻한 사케의 조화.</p>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 25px; border-radius: 16px;">
                            <h3 style="color: var(--accent-primary); margin-bottom: 15px;">🧀 치즈/양식과 함께</h3>
                            <p style="color: var(--text-secondary);">산미가 있는 긴조. <strong>아라마사 No.6</strong>, <strong>신세키 긴조</strong> 추천. 크리미한 음식과 상큼한 산미의 매칭.</p>
                        </div>
                        <div style="background: var(--bg-tertiary); padding: 25px; border-radius: 16px;">
                            <h3 style="color: var(--accent-primary); margin-bottom: 15px;">🍰 디저트와 함께</h3>
                            <p style="color: var(--text-secondary);">달콤한 니고리자케 또는 귀양주. <strong>카모츠루 니고리</strong>, <strong>키쿠히메 다이긴조</strong> 추천. 달콤한 맛끼리의 조화.</p>
                        </div>
                    </div>

                    <div style="background: linear-gradient(135deg, var(--accent-gold), var(--accent-rose)); padding: 30px; border-radius: 20px; text-align: center; color: white;">
                        <h3 style="margin-bottom: 15px;">🍶 최고의 추천은 자신의 미각</h3>
                        <p style="opacity: 0.95;">추천은 참고일 뿐, 가장 좋은 사케는 자신이 맛있다고 느끼는 사케입니다.<br>다양하게 시도하고 '사케를 보다'에 기록해보세요!</p>
                    </div>

                    <p style="margin-top: 50px; color: var(--text-muted); font-size: 0.9em; text-align: center;">
                        ※ 가격은 한국 시장 기준 참고가이며 변동될 수 있습니다.<br>
                        마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}
                    </p>
                </div>
            </div>
    `,

    kikizakeshi: () => `
            <div style="max-width: 1000px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 50px;">
                    <h1 style="font-size: 2.5em; margin: 20px 0; color: var(--accent-primary); font-family: 'Cormorant Garamond', serif;">키키자케시</h1>
                    <p style="color: var(--text-muted);">사케의 매력을 깨워주는 마법사, Kikizake-shi</p>
                    <div style="width: 60px; height: 2px; background: linear-gradient(90deg, var(--accent-gold), var(--accent-rose)); margin: 20px auto;"></div>
                </div>

                <div style="line-height: 1.9; color: var(--text-primary);">
                    <!-- 인트로 -->
                    <div style="background: var(--bg-tertiary); padding: 40px; border-radius: 20px; margin-bottom: 50px; border-left: 4px solid var(--accent-gold);">
                        <p style="font-size: 1.1em; color: var(--text-secondary); margin-bottom: 15px;">
                            이자카야나 일식 레스토랑에서 어떤 사케를 마실지 몰라 메뉴판만 한참 보신 적 있나요?
                        </p>
                        <p style="font-size: 1.1em; color: var(--text-secondary);">
                            이럴 때 구세주처럼 나타나 나에게 딱 맞는 사케를 골라주는 전문가, 바로 <strong style="color: var(--accent-gold);">'키키자케시(利き酒師)'</strong>입니다.
                        </p>
                    </div>

                    <!-- 1. 키키자케시는 어떤 일을 하나요? -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 40px; border: 1px solid var(--border-light);">
                        <h2 style="color: var(--accent-primary); margin-bottom: 25px; font-family: 'Cormorant Garamond', serif; display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 1.5em;">🎓</span> 1. 키키자케시는 어떤 일을 하나요?
                        </h2>
                        <p style="font-size: 1.05em; margin-bottom: 20px;">
                            한마디로 <strong style="color: var(--accent-gold);">'사케 소믈리에'</strong>입니다.
                            일본주(사케)의 재료와 제조 공정을 파악해 맛을 감별하고, 고객의 취향과 음식에 가장 잘 어울리는 한 잔을 제안하는 서비스 전문가예요.
                        </p>
                        <p style="font-size: 1.05em; margin-bottom: 25px; padding: 20px; background: var(--bg-tertiary); border-radius: 12px; text-align: center;">
                            단순히 지식을 뽐내는 것이 아니라, <strong style="color: var(--accent-rose);">'가장 맛있는 순간'</strong>을 설계합니다.
                        </p>

                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                            <div style="background: var(--bg-tertiary); padding: 25px; border-radius: 16px;">
                                <h4 style="color: var(--accent-gold); margin-bottom: 12px;">🌡️ 온도 조절</h4>
                                <p style="color: var(--text-secondary); font-size: 0.95em;">차갑게 마실지(히야), 따뜻하게 데울지(칸) 결정</p>
                            </div>
                            <div style="background: var(--bg-tertiary); padding: 25px; border-radius: 16px;">
                                <h4 style="color: var(--accent-gold); margin-bottom: 12px;">🍶 기물 선택</h4>
                                <p style="color: var(--text-secondary); font-size: 0.95em;">사케의 향을 극대화할 잔(도자기, 유리 등)을 매칭</p>
                            </div>
                            <div style="background: var(--bg-tertiary); padding: 25px; border-radius: 16px;">
                                <h4 style="color: var(--accent-gold); margin-bottom: 12px;">🍣 페어링</h4>
                                <p style="color: var(--text-secondary); font-size: 0.95em;">요리의 풍미를 살려주는 최적의 사케 추천</p>
                            </div>
                        </div>
                    </div>

                    <!-- 2. 사케의 4가지 스타일 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 40px; border: 1px solid var(--border-light);">
                        <h2 style="color: var(--accent-primary); margin-bottom: 25px; font-family: 'Cormorant Garamond', serif; display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 1.5em;">🎯</span> 2. 키키자케시가 분류하는 사케의 4가지 얼굴
                        </h2>
                        <p style="margin-bottom: 25px; color: var(--text-secondary);">
                            사케는 향과 맛에 따라 크게 4가지 스타일로 나뉩니다. 키키자케시는 이 분류법을 통해 고객의 취향을 정확히 저격하죠!
                        </p>

                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; background: var(--bg-tertiary); border-radius: 16px; overflow: hidden;">
                                <thead>
                                    <tr style="background: linear-gradient(135deg, var(--accent-gold), var(--accent-rose)); color: white;">
                                        <th style="padding: 18px 15px; text-align: left; font-weight: 600;">유형</th>
                                        <th style="padding: 18px 15px; text-align: left; font-weight: 600;">특징</th>
                                        <th style="padding: 18px 15px; text-align: left; font-weight: 600;">한마디 요약</th>
                                    </tr>
                                </thead>
                                <tbody style="color: var(--text-secondary);">
                                    <tr style="border-bottom: 1px solid var(--border-light);">
                                        <td style="padding: 18px 15px;"><strong style="color: var(--accent-gold);">쿤슈(薫酒)</strong></td>
                                        <td style="padding: 18px 15px;">과일과 꽃향이 화려하고 경쾌한 맛</td>
                                        <td style="padding: 18px 15px;">"화사하고 향긋한 사케"</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid var(--border-light);">
                                        <td style="padding: 18px 15px;"><strong style="color: var(--accent-gold);">소슈(爽酒)</strong></td>
                                        <td style="padding: 18px 15px;">깔끔하고 청량감이 느껴지는 가벼운 맛</td>
                                        <td style="padding: 18px 15px;">"시원하고 깔끔한 사케"</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid var(--border-light);">
                                        <td style="padding: 18px 15px;"><strong style="color: var(--accent-gold);">준슈(醇酒)</strong></td>
                                        <td style="padding: 18px 15px;">쌀 본연의 감칠맛과 묵직한 바디감</td>
                                        <td style="padding: 18px 15px;">"진하고 구수한 사케"</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 18px 15px;"><strong style="color: var(--accent-gold);">주쿠슈(熟酒)</strong></td>
                                        <td style="padding: 18px 15px;">잘 익은 과일과 향신료의 복합적인 풍미</td>
                                        <td style="padding: 18px 15px;">"깊고 중후한 매력의 사케"</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 3. 한국에서 키키자케시가 되는 방법 -->
                    <div style="background: var(--card-bg); padding: 35px; border-radius: 20px; margin-bottom: 40px; border: 1px solid var(--border-light);">
                        <h2 style="color: var(--accent-primary); margin-bottom: 25px; font-family: 'Cormorant Garamond', serif; display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 1.5em;">🇰🇷</span> 3. 한국에서 키키자케시가 되는 방법
                        </h2>
                        <p style="margin-bottom: 25px; color: var(--text-secondary);">
                            일본에 직접 가지 않아도 한국에서 세계적으로 공인되는 <strong>SSI(일본주서비스연구회)</strong> 인증 키키자케시 자격증을 취득할 수 있습니다.
                        </p>

                        <div style="background: linear-gradient(135deg, rgba(219, 223, 172, 0.1), rgba(219, 223, 172, 0.1)); padding: 30px; border-radius: 16px; border: 1px solid var(--accent-gold); margin-bottom: 25px;">
                            <h3 style="color: var(--accent-gold); margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                                🏫 숭실대학교 키키자케시 교육 과정
                            </h3>
                            <p style="color: var(--text-secondary); margin-bottom: 15px;">
                                가장 대표적이고 공신력 있는 교육 기관이 바로 <strong>숭실대학교</strong>입니다.
                            </p>
                        </div>

                        <div style="display: grid; gap: 15px;">
                            <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px; display: flex; gap: 15px; align-items: start;">
                                <span style="font-size: 1.5em;">📚</span>
                                <div>
                                    <strong style="color: var(--accent-primary);">교육 과정</strong>
                                    <p style="color: var(--text-secondary); margin-top: 5px; font-size: 0.95em;">숭실대학교 내 전문 교육 과정을 통해 이론부터 실습까지 체계적으로 배웁니다.</p>
                                </div>
                            </div>
                            <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px; display: flex; gap: 15px; align-items: start;">
                                <span style="font-size: 1.5em;">✨</span>
                                <div>
                                    <strong style="color: var(--accent-primary);">특징</strong>
                                    <p style="color: var(--text-secondary); margin-top: 5px; font-size: 0.95em;">일본 현지와 동일한 커리큘럼을 한국어로 수강하고 시험까지 치를 수 있어 매우 효율적입니다.</p>
                                </div>
                            </div>
                            <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px; display: flex; gap: 15px; align-items: start;">
                                <span style="font-size: 1.5em;">👥</span>
                                <div>
                                    <strong style="color: var(--accent-primary);">추천 대상</strong>
                                    <p style="color: var(--text-secondary); margin-top: 5px; font-size: 0.95em;">사케를 깊이 있게 즐기고 싶은 일반인부터, 전문성을 갖추고 싶은 주류/외식업계 종사자까지 모두에게 열려 있습니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 4. 왜 키키자케시가 매력적일까요? -->
                    <div style="background: linear-gradient(135deg, var(--accent-gold), var(--accent-rose)); padding: 40px; border-radius: 20px; color: white; text-align: center;">
                        <h2 style="margin-bottom: 20px; font-family: 'Cormorant Garamond', serif; font-size: 1.6em;">
                            🍶 왜 키키자케시가 매력적일까요?
                        </h2>
                        <p style="font-size: 1.05em; opacity: 0.95; line-height: 1.8; max-width: 700px; margin: 0 auto;">
                            사케 한 잔에 담긴 쌀의 풍미와 양조장의 철학을 이해하면,<br>
                            술자리는 단순한 모임을 넘어 <strong>하나의 문화적 체험</strong>이 됩니다.<br><br>
                            소중한 사람들에게 음식에 딱 맞는 사케를 추천해 주며<br>
                            즐거움을 선사하는 전문가의 삶, 정말 멋지지 않나요?
                        </p>
                    </div>

                    <p style="margin-top: 50px; color: var(--text-muted); font-size: 0.9em; text-align: center;">
                        마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}
                    </p>
                </div>
            </div>
    `,

    faq: () => `
            <div style="max-width: 900px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 50px;">
                    <h1 style="font-size: 2.5em; margin: 20px 0; color: var(--accent-primary); font-family: 'Cormorant Garamond', serif;">자주 묻는 질문</h1>
                    <p style="color: var(--text-muted);">사케를 보다 서비스와 사케에 관한 FAQ</p>
                    <div style="width: 60px; height: 2px; background: linear-gradient(90deg, var(--accent-gold), var(--accent-rose)); margin: 20px auto;"></div>
                </div>

                <div style="line-height: 1.9; color: var(--text-primary);">
                    <!-- 서비스 관련 FAQ -->
                    <h2 style="color: var(--accent-gold); margin-bottom: 25px; font-size: 1.3em;">📱 서비스 이용</h2>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 사케를 보다는 무료인가요?</h3>
                        <p style="color: var(--text-secondary);">네, 완전 무료입니다. 회원가입 후 모든 기능을 제한 없이 사용하실 수 있습니다. 테이스팅 노트 작성, 사진 저장, 클라우드 동기화 모두 무료로 제공됩니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 회원가입 없이도 사용할 수 있나요?</h3>
                        <p style="color: var(--text-secondary);">사케 가이드, 용어사전, FAQ는 비로그인으로도 볼 수 있습니다. 단, 테이스팅 노트를 저장하려면 회원가입이 필요합니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 내 데이터는 안전한가요?</h3>
                        <p style="color: var(--text-secondary);">네, 모든 데이터는 보안 서버에 안전하게 저장됩니다. 작성한 노트는 커뮤니티 탭에 익명으로 공유되며, 이메일 등 개인정보는 표시되지 않습니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 모바일에서도 사용할 수 있나요?</h3>
                        <p style="color: var(--text-secondary);">네, 반응형 웹으로 제작되어 스마트폰, 태블릿, PC 어디서든 최적화된 화면으로 이용하실 수 있습니다. 별도 앱 설치가 필요 없습니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 40px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 계정을 삭제하고 싶어요.</h3>
                        <p style="color: var(--text-secondary);">계정 삭제를 원하시면 sakeview@sakeview.com으로 가입 시 사용한 이메일 주소와 함께 삭제 요청을 보내주세요. 영업일 기준 3일 이내 처리됩니다.</p>
                    </div>

                    <!-- 사케 관련 FAQ -->
                    <h2 style="color: var(--accent-gold); margin-bottom: 25px; font-size: 1.3em;">🍶 사케 상식</h2>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 사케와 소주는 다른 건가요?</h3>
                        <p style="color: var(--text-secondary);">네, 완전히 다릅니다. 사케(니혼슈)는 쌀을 발효시켜 만드는 양조주로 알코올 도수가 14-16% 정도입니다. 일본 소주(쇼추)는 증류주로 25-45% 정도의 높은 도수를 가집니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 준마이와 긴조 중 어떤 게 더 좋나요?</h3>
                        <p style="color: var(--text-secondary);">취향의 문제입니다. 준마이는 쌀의 풍미가 진하고 우마미가 강합니다. 긴조는 과일향이 화려하고 가벼운 맛입니다. 둘 다 훌륭한 사케이며, 상황과 음식에 맞게 선택하면 됩니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 사케에 유통기한이 있나요?</h3>
                        <p style="color: var(--text-secondary);">법적 유통기한은 없지만, 일반적으로 제조일로부터 1년 이내에 마시는 것이 좋습니다. 긴조나 다이긴조는 6개월 이내가 더 좋고, 개봉 후에는 냉장 보관하며 1-2주 내에 마시세요.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 사케는 냉장 보관해야 하나요?</h3>
                        <p style="color: var(--text-secondary);">긴조, 다이긴조, 나마자케(생사케)는 반드시 냉장 보관이 필요합니다. 준마이나 혼조조는 서늘하고 어두운 곳에 보관해도 되지만, 냉장 보관이 더 좋습니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 사케를 데워 마시면 맛이 떨어지나요?</h3>
                        <p style="color: var(--text-secondary);">꼭 그렇지 않습니다. 준마이나 혼조조는 데워 마시면 우마미가 더 살아나고 부드러워집니다. 단, 긴조나 다이긴조는 섬세한 향이 날아갈 수 있어 차갑게 마시는 것을 추천합니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 사케를 처음 마시는데 추천해주세요.</h3>
                        <p style="color: var(--text-secondary);">처음이시라면 쥰마이 긴조(純米吟醸)를 추천합니다. 순수한 쌀 맛과 화려한 과일향의 균형이 좋아 입문용으로 적합합니다. 닷사이(獺祭), 쿠보타(久保田), 핫카이산(八海山) 등이 대표적입니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 40px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 한국에서 사케는 어디서 구매하나요?</h3>
                        <p style="color: var(--text-secondary);">대형 마트(이마트, 홈플러스, 롯데마트)의 주류 코너, 백화점 식품관, 주류 전문점에서 구매할 수 있습니다. 온라인은 법적 규제로 직접 구매가 어려우나, 일부 주류 전문 매장에서 전화 주문 후 픽업이 가능합니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 정미보합이 낮을수록 좋은 사케인가요?</h3>
                        <p style="color: var(--text-secondary);">반드시 그렇지는 않습니다. 정미보합이 낮으면(많이 깎으면) 깔끔하고 섬세한 맛이 나지만, 높은 정미보합의 사케는 쌀의 풍미와 우마미가 더 풍부합니다. 취향과 페어링에 따라 선택하면 됩니다. 비싼 사케가 항상 맛있는 것도 아닙니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 사케잔은 어떤 것을 사용해야 하나요?</h3>
                        <p style="color: var(--text-secondary);">긴조/다이긴조처럼 향이 좋은 사케는 와인 글라스가 좋고, 데워서 마시는 사케는 전통 오초코(작은 도자기 잔)가 어울립니다. 하지만 가장 중요한 건 편하게 즐기는 것이니 너무 형식에 얽매이지 않아도 됩니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 사케를 마시면 숙취가 덜한가요?</h3>
                        <p style="color: var(--text-secondary);">순수한 사케(특히 준마이)는 다른 술에 비해 숙취가 적다는 의견이 많습니다. 이는 양조 알코올이 적고 불순물이 적기 때문입니다. 하지만 역시 과음하면 숙취가 있으며, 물을 함께 마시고 적정량을 즐기는 것이 좋습니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 사케는 몇 도에서 마시는 것이 좋나요?</h3>
                        <p style="color: var(--text-secondary);">사케 종류에 따라 다릅니다. 긴조/다이긴조는 5-15°C로 차게, 준마이/혼조조는 15-45°C로 상온~따뜻하게 마시면 좋습니다. 같은 사케도 온도에 따라 전혀 다른 맛을 느낄 수 있으니 다양하게 시도해보세요.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 나마자케(생사케)는 무엇이 다른가요?</h3>
                        <p style="color: var(--text-secondary);">나마자케는 가열 살균(히이레)을 거치지 않은 생사케입니다. 신선하고 프레시한 맛이 특징이지만, 반드시 냉장 보관해야 하며 개봉 후 빨리 마셔야 합니다. 효모가 살아있어 맛이 계속 변합니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 사케와 어울리지 않는 음식이 있나요?</h3>
                        <p style="color: var(--text-secondary);">사케는 대부분의 일식과 잘 어울립니다. 다만 향이 매우 강한 음식(커리, 마늘 요리 등)이나 매운 음식은 섬세한 사케의 맛을 가릴 수 있습니다. 이런 경우 드라이하고 풍미가 강한 준마이를 선택하세요.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 일본 여행 시 사케를 얼마나 가져올 수 있나요?</h3>
                        <p style="color: var(--text-secondary);">한국 입국 시 면세 한도는 1인당 2병(총 2리터 이하, 총 가격 400달러 이하)입니다. 초과 시 주세와 부가세를 납부해야 합니다. 2024년 기준이며, 최신 규정은 관세청에서 확인하세요.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 40px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 사케 라벨 읽는 법을 알고 싶어요.</h3>
                        <p style="color: var(--text-secondary);">주요 표기: <strong>銘柄(메이가라)</strong>=브랜드명, <strong>特定名称(토쿠테이 메이쇼)</strong>=등급(純米大吟醸 등), <strong>精米歩合</strong>=정미보합, <strong>アルコール分</strong>=알코올 도수, <strong>日本酒度</strong>=단맛/드라이, <strong>酸度</strong>=산도, <strong>原料米</strong>=쌀 품종. 영어 병기가 있는 제품도 많습니다.</p>
                    </div>

                    <!-- 테이스팅 관련 FAQ -->
                    <h2 style="color: var(--accent-gold); margin-bottom: 25px; font-size: 1.3em;">📝 테이스팅 & 기록</h2>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 테이스팅 노트는 어떻게 작성하나요?</h3>
                        <p style="color: var(--text-secondary);">'새 노트' 탭에서 사케를 선택한 후, 향 · 맛 · 바디감 · 여운 · 페어링 카테고리별로 느낀 특징을 태그로 탭하세요. 한 번 더 탭하면 메인 태그로 지정됩니다. 마지막으로 0~100점 종합 평점과 감상평을 남기면 완성!</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 20px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 향을 표현하기 어려워요. 팁이 있나요?</h3>
                        <p style="color: var(--text-secondary);">처음엔 큰 카테고리로 시작하세요: 과일향(사과, 배, 바나나, 멜론), 꽃향(장미, 흰꽃), 쌀/곡물향, 유제품향(요거트, 버터), 견과류향 등. 경험이 쌓이면 더 구체적으로 표현할 수 있게 됩니다.</p>
                    </div>

                    <div style="background: var(--card-bg); padding: 25px; border-radius: 16px; margin-bottom: 40px; border: 1px solid var(--border-light);">
                        <h3 style="color: var(--accent-primary); margin-bottom: 12px;">Q. 테이스팅할 때 물은 마셔도 되나요?</h3>
                        <p style="color: var(--text-secondary);">오히려 권장됩니다! "야와라기미즈(和らぎ水)"라고 해서 사케와 함께 물을 마시면 입을 리셋하고 다음 맛을 더 잘 느낄 수 있습니다. 숙취 예방에도 도움이 됩니다.</p>
                    </div>

                    <!-- 추가 안내 -->
                    <div style="background: var(--bg-tertiary); padding: 30px; border-radius: 20px; text-align: center;">
                        <h3 style="color: var(--accent-primary); margin-bottom: 15px;">💬 더 궁금한 점이 있으신가요?</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 20px;">FAQ에서 답을 찾지 못하셨다면 언제든 문의해주세요.</p>
                        <a href="mailto:sakeview@sakeview.com" style="display: inline-block; background: var(--accent-gold); color: white; padding: 12px 30px; border-radius: 10px; text-decoration: none; font-weight: 600;">문의하기</a>
                    </div>

                    <p style="margin-top: 50px; color: var(--text-muted); font-size: 0.9em; text-align: center;">
                        자주 묻는 질문은 지속적으로 업데이트됩니다.<br>
                        마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}
                    </p>
                </div>
            </div>
    `,

};
